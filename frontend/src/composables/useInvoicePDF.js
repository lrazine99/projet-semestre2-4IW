// composables/useInvoicePDF.js
// import { jsPDF } from 'jspdf'

export function useInvoicePDF() {
  const generatePDF = (invoiceData) => {
    const { jsPDF } = window.jspdf  // Get jsPDF from window

    return new Promise((resolve, reject) => {
      const {
        companyLogo,
        creationDate,
        invoiceId,
        company,
        client,
        items = [],
        totalWithoutTax,
        totalTax,
        totalWithTax,
        notes
      } = invoiceData

      const invoiceHTML = `
      <div class="py-4">
        <div class="px-14 py-6">
          <table class="w-full border-collapse border-spacing-0">
            <tbody>
              <tr>
                <td class="w-full align-top">
                  <div>
                    <img src="${companyLogo}" class="h-12" alt="Company Logo" />
                  </div>
                </td>
                <td class="align-top">
                  <div class="text-sm">
                    <table class="border-collapse border-spacing-0">
                      <tbody>
                        <tr>
                          <td class="border-r pr-4">
                            <div>
                              <p class="whitespace-nowrap text-slate-400 text-right">Date de Creation</p>
                              <p class="whitespace-nowrap font-bold text-main text-right">${creationDate}</p>
                            </div>
                          </td>
                         
                          <td class="pl-4">
                            <div>
                              <p class="whitespace-nowrap text-slate-400 text-right">Facture #</p>
                              <p class="whitespace-nowrap font-bold text-main text-right">${invoiceId}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bg-slate-100 px-14 py-6 text-sm">
          <table class="w-full border-collapse border-spacing-0">
            <tbody>
              <tr>
                <td class="w-1/2 align-top">
                  <div class="text-sm text-neutral-600">
                    <p class="font-bold">${company.name}</p>
                    <p>${company.address}</p>
                    <p>${company.city}, ${company.zipCode}</p>
                  </div>
                </td>
                <td class="w-1/2 align-top text-right">
                  <div class="text-sm text-neutral-600">
                    <p class="font-bold">${client.firstName} ${client.lastName}</p>
                    <p>${client.address}</p>
                    <p>${client.city}, ${client.zipCode}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-14 py-10 text-sm text-neutral-700">
          <table class="w-full border-collapse border-spacing-0">
            <thead>
              <tr>
                <td class="border-b-2 border-main pb-3 pl-3 font-bold text-main">#</td>
                <td class="border-b-2 border-main pb-3 pl-2 font-bold text-main">Produit</td>
                <td class="border-b-2 border-main pb-3 pl-2 text-right font-bold text-main">Price</td>
                <td class="border-b-2 border-main pb-3 pl-2 text-center font-bold text-main">Quantité</td>
                <td class="border-b-2 border-main pb-3 pl-2 text-center font-bold text-main">TVA</td>
                <td class="border-b-2 border-main pb-3 pl-2 text-right font-bold text-main">Total HT</td>
                <td class="border-b-2 border-main pb-3 pl-2 pr-3 text-right font-bold text-main">TTC</td>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, index) => `
                  <tr>
                    <td class="border-b py-3 pl-3">${index + 1}</td>
                    <td class="border-b py-3 pl-2">${item.name}</td>
                    <td class="border-b py-3 pl-2 text-right">${item.price} €</td>
                    <td class="border-b py-3 pl-2 text-center">${item.quantity}</td>
                    <td class="border-b py-3 pl-2 text-center">${item.taxRate}%</td>
                    <td class="border-b py-3 pl-2 text-right">${item.totalWithoutTax} €</td>
                    <td class="border-b py-3 pl-2 pr-3 text-right">${item.totalWithTax} €</td>
                  </tr>`
                )
                .join('')}


                <tr>
                <td colspan="7">
                  <table class="w-full border-collapse border-spacing-0">
                    <tbody>
                      <tr>
                        <td class="w-full"></td>
                        <td>
                          <table class="w-full border-collapse border-spacing-0">
                            <tbody>
                              <tr>
                                <td class="border-b p-3 text-right">
                                  <div class="whitespace-nowrap text-slate-400">Total HT:</div>
                                </td>
                                <td class="border-b p-3 text-right">
                                  <div class="whitespace-nowrap font-bold text-main">${totalWithoutTax} €</div>
                                </td>
                              </tr>
                              <tr>
                                <td class="p-3 text-right">
                                  <div class="whitespace-nowrap text-slate-400">TVA:</div>
                                </td>
                                <td class="p-3 text-right">
                                  <div class="whitespace-nowrap font-bold text-main">${totalTax} €</div>
                                </td>
                              </tr>
                              <tr>
                                <td class="bg-main p-3 text-right">
                                  <div class="whitespace-nowrap font-bold  text-slate-400">Total TTC:</div>
                                </td>
                                <td class="bg-main p-3 text-right">
                                  <div class="whitespace-nowrap font-bold ">${totalWithTax}</div>
                                </td>
                              </tr>
                              <tr>
                                <td class="bg-main p-3">
                                  <div class="whitespace-nowrap font-bold  text-slate-400">Moyen(s) de paiement :</div>
                                </td>
                                <td class="bg-main p-3 text-right">
                                  <div class="whitespace-nowrap font-bold ">carte bancaire</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    <tr>
                
            </tbody>
          </table>
        </div>
        <div class="px-14 py-10 text-sm text-neutral-700">
          <p class="text-main font-bold">Notes</p>
          <p class="italic">${notes}</p>
        </div>
      </div>
    `

      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.html(invoiceHTML, {
        callback: (doc) => {
          // doc.save(fileName) // Download the PDF
          try {
            const pdfBlob = doc.output('blob')
            resolve(pdfBlob) // Resolve with the Blob
          } catch (error) {
            reject(error) // Reject if an error occurs
          }
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800
      })
    })
  }

  return { generatePDF }
}
