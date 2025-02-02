import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import puppeteer from "puppeteer"

export async function GET(
  req: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    const orderId = await Promise.resolve(context.params.orderId)
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true,
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1a1a1a;
              border-bottom: 2px solid #1a1a1a;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #666;
            }
            .detail-row {
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
          </div>
          
          <div class="section">
            <div class="detail-row">Order Reference: ${order.referenceId}</div>
            <div class="detail-row">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Transaction Details</div>
            <div class="detail-row">Type: ${order.type}</div>
            <div class="detail-row">Asset: ${order.asset}</div>
            <div class="detail-row">Quantity: ${order.quantity}</div>
            <div class="detail-row">Price per Token: ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: order.currency,
            }).format(Number(order.pricePerToken))}</div>
            <div class="detail-row">Total Amount: ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: order.currency,
            }).format(Number(order.totalAmount))}</div>
            <div class="detail-row">Status: ${order.status}</div>
          </div>

          <div class="footer">
            Thank you for your business!
          </div>
        </body>
      </html>
    `

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })

    await browser.close()

    // Return the PDF
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.referenceId}.pdf`,
      },
    })

  } catch (error) {
    console.error("[ORDER_INVOICE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}