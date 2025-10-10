import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const companyId = url.searchParams.get("companyId");

    if (!token || !companyId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Calcola automaticamente ultimi 3 mesi dalla data odierna
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // Formato YYYYMMDD
    const startDate = `${threeMonthsAgo.getFullYear()}${String(
      threeMonthsAgo.getMonth() + 1
    ).padStart(2, "0")}${String(threeMonthsAgo.getDate()).padStart(2, "0")}`;

    const endDate = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    // Funzione per recuperare una pagina di fatture
    async function fetchInvoicesPage(page: number) {
      const queryParams = new URLSearchParams({
        type: "invoice",
        q: `date >= ${startDate} AND date <= ${endDate}`,
        per_page: "100",
        page: page.toString(),
        fieldset: "detailed",
      });

      const response = await fetch(
        `https://api-v2.fattureincloud.it/c/${companyId}/issued_documents?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }

      return await response.json();
    }

    // Recupera tutte le pagine
    let allInvoices: any[] = [];
    const firstPage = await fetchInvoicesPage(1);

    if (firstPage?.data) {
      allInvoices = [...firstPage.data];

      const lastPage = firstPage.last_page || 1;
      for (let page = 2; page <= lastPage; page++) {
        const pageData = await fetchInvoicesPage(page);
        if (pageData?.data) {
          allInvoices = [...allInvoices, ...pageData.data];
        }
      }
    }

    // 🔍 FILTRO: Mantieni solo le fatture che hanno almeno un item con code = "AV", "INS" o "MDO"
    const validCodes = ["AV", "INS", "MDO"];
    const filteredInvoices = allInvoices.filter((invoice) => {
      if (!invoice.items_list || !Array.isArray(invoice.items_list)) {
        return false;
      }

      return invoice.items_list.some((item: any) =>
        validCodes.includes(item.code)
      );
    });

    console.log(
      `📊 Fatture totali: ${allInvoices.length}, Fatture filtrate: ${filteredInvoices.length}`
    );

    // Trasforma i dati
    const currentYear = new Date().getFullYear();
    const yearSuffix = String(currentYear).slice(-2);

    const transformedInvoices = filteredInvoices.map((invoice) => {
      let contractNumber = "";

      if (invoice.items_list && invoice.items_list.length > 0) {
        for (const item of invoice.items_list) {
          if (!item.description) continue;

          const contractPattern = /Rif\.\s*Contratto\s*(?:nr\.|n\.)?\s*(\d+)/i;
          const match = item.description.match(contractPattern);

          if (match && match[1]) {
            contractNumber = match[1];
            break;
          } else {
            const allNumbers = item.description.match(/\d+/g) || [];
            for (const num of allNumbers) {
              if (
                (num.length === 4 && !num.startsWith("20")) ||
                num.length === 6
              ) {
                contractNumber = num;
                break;
              }
            }
            if (contractNumber) break;
          }
        }
      }

      // Estrai i codici e nomi di tutti gli item
      const itemsCodes =
        invoice.items_list?.map((item: any) => item.code).filter(Boolean) || [];
      const itemsNames =
        invoice.items_list?.map((item: any) => item.name).filter(Boolean) || [];

      // Primo item (per retrocompatibilità)
      const serviceName = invoice.items_list?.[0]?.name || "";
      const serviceCode = invoice.items_list?.[0]?.code || "";

      return {
        id: invoice.id,
        type: invoice.type,
        amount_net: invoice.amount_net,
        amount_vat: invoice.amount_vat,
        amount_gross: invoice.amount_gross,
        entity: {
          name: invoice.entity.name,
          vat_number: invoice.entity.vat_number,
          tax_code: invoice.entity.tax_code || "",
          address_street: invoice.entity.address_street,
          address_postal_code: invoice.entity.address_postal_code,
          address_city: invoice.entity.address_city,
          address_province: invoice.entity.address_province,
          country: invoice.entity.country,
          id: invoice.entity.id,
        },
        contract_number: contractNumber,
        date: invoice.date,
        number: `${invoice.number}/${yearSuffix}`,
        url: invoice.url,
        service_name: serviceName,
        service_code: serviceCode,
        items_codes: itemsCodes,
        items_names: itemsNames,
      };
    });

    return NextResponse.json({
      data: transformedInvoices.reverse(),
      total: transformedInvoices.length,
      stats: {
        totalInvoices: allInvoices.length,
        filteredInvoices: filteredInvoices.length,
        excludedInvoices: allInvoices.length - filteredInvoices.length,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
