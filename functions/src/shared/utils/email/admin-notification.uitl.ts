import { IBookingSlot } from "src/booking/booking.interface";
import { IAdminNotificationTemplateData } from "../../interfaces";

interface IBookingSlotWithProduct extends IBookingSlot {
  productTitle: string;
  productPrice: number;
}

export const GetAdminNotificationTemplate = (
  templateData: IAdminNotificationTemplateData
) => {
  const slotsWithProductData = templateData.bookings.map((b) => {
    const product = templateData.products.find((p) => p.id === b.productId);

    return {
      ...b,
      productTitle: product?.title || "",
      productPrice: product?.price || 0,
    };
  });

  const bookingSlotsDataHtml = renderBookingSlotsForEmail(slotsWithProductData);

  return {
    from: "Tkachuk Massage Therapy <tkachuk_massage_therapy@gmail.com>",
    subject: "Підтвердження замовлення",
    to: templateData.adminEmailAddress,
    html: buildTemplate(templateData, bookingSlotsDataHtml),
  };
};

/* eslint-disable indent */
const buildTemplate = (
  templateData: IAdminNotificationTemplateData,
  bookingSlotsRendered: string
): string => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head> </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" /><!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->
    <style type="text/css">
      * {
        text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }

      html {
        height: 100%;
        width: 100%;
      }

      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        mso-line-height-rule: exactly;
      }

      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }

      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      .ReadMsgBody,
      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
    </style><!--[if gte mso 9]>
      <style type="text/css">
      li { text-indent: -1em; }
      table td { border-collapse: collapse; }
      </style>
      <![endif]-->
    <title> </title>
    <!-- content -->
    <!--[if gte mso 9]><xml>
       <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
       </o:OfficeDocumentSettings>
      </xml><![endif]-->
  </head>
  <body class="body" style="background-color: #EEEEEE; margin: 0; width: 100%;">
    <table class="bodyTable" role="presentation" width="100%" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #EEEEEE; margin: 0;" bgcolor="#EEEEEE">
      <tr>
        <td class="body__content" align="left" width="100%" valign="top" style="color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px;">
          <div class="container" style="width: 100%; margin: 10px auto; max-width: 700px;"> <!--[if mso | IE]> <table class="container__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0" style=" margin-right: auto; margin-left: auto;width: 700px" width="700" align="center">
              <tr>
                <td> <![endif]--> <table class="container__table" role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%">
                    <tr class="container__row">
                      <td class="container__cell" width="100%" align="left" valign="top" style="background-color: #FFFFFF; border: 1px solid #D2D2D2; padding: 10px 20px;" bgcolor="#FFFFFF">
                        <div class="row">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="700" style="padding: 0 10px;width: 100%" align="left" valign="top">
                                <figure class="logo-figure" href="localhost://4200" target="_blank" style="display: inline-block; margin: 16px 0; width: 100%;">
                                  <img class="logo-img img__block" src="https://firebasestorage.googleapis.com/v0/b/mt-stage-db6be.appspot.com/o/mt-logo.png?alt=media&token=995a3cbe-4467-4321-bd40-9d1ea40f0197" alt="Logo" title="Logo" border="0" style="max-width: 100%; width: 175px; display: inline;" width="175" />
                                </figure>
                                <h2 id="email-title" class="email-title header h2" style="margin: 20px 0; line-height: 30px; font-family: Helvetica,Arial,sans-serif; color: #044E3B; text-align: center;">Замовлення</h2>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <div class="hr" style="margin: 0 auto; width: 100%;"> <!--[if mso | IE]> <table class="hr__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-right: auto; margin-left: auto; width: 100%;" width="100%" align="center">
                            <tr>
                              <td> <![endif]--> <table class="hr__table" role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                                  <tr class="hr__row">
                                    <td class="hr__cell" width="100%" align="left" valign="top" style="border-top: 1px solid #9A9A9A; border-color: #DDDDDD;">&nbsp;</td>
                                  </tr>
                                </table> <!--[if mso | IE]> </td>
                            </tr>
                          </table> <![endif]--> </div>
                        <div class="row">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="700" style="padding: 0 10px;width: 100%" align="left" valign="top">
                                <h5 class="email-message header h5" style="margin: 20px 0; line-height: 17px; font-family: Helvetica,Arial,sans-serif; color: #044E3B;">
                                  <span style="display: block;">Ім'я: </span>
                                  <span style="display: block;">${
                                    templateData.name || "-"
                                  }</span>
                                </h5>
                                <h5 class="email-message header h5" style="margin: 20px 0; line-height: 17px; font-family: Helvetica,Arial,sans-serif; color: #044E3B;">
                                  <span style="display: block;">Телефон: </span>
                                  <span style="display: block;">${
                                    templateData.phone
                                  }</span>
                                </h5>
                                <h5 class="email-message header h5" style="margin: 20px 0; line-height: 17px; font-family: Helvetica,Arial,sans-serif; color: #044E3B;">
                                  <span style="display: block;">Email: </span>
                                  <span style="display: block;">${
                                    templateData.email
                                  }</span>
                                </h5>
                                <h5 class="email-message header h5" style="margin: 20px 0; line-height: 17px; font-family: Helvetica,Arial,sans-serif; color: #044E3B;">
                                  <span style="display: block;">Коментар: </span>
                                  <span style="display: block;">${
                                    templateData.comment || "-"
                                  }</span>
                                </h5>
                                <h5 class="email-message header h5" style="margin: 20px 0; line-height: 17px; font-family: Helvetica,Arial,sans-serif; color: #044E3B;">
                                  <span style="display: block;">Замовленні послуги: </span>
                                  <span style="display: block;">${bookingSlotsRendered}</span>
                                </h5>
                                <a class="main-link a" href="${
                                  templateData.confirmLink
                                }" style="margin-bottom: 24px; color: #8AC343; display: inline-block;"><span class="a__text" style="color: #8AC343;">Підтвердити чи відхилити замовлення</span></a>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <div class="hr" style="margin: 0 auto; width: 100%;"> <!--[if mso | IE]> <table class="hr__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-right: auto; margin-left: auto; width: 100%;" width="100%" align="center">
                            <tr>
                              <td> <![endif]--> <table class="hr__table" role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                                  <tr class="hr__row">
                                    <td class="hr__cell" width="100%" align="left" valign="top" style="border-top: 1px solid #9A9A9A; border-color: #DDDDDD;">&nbsp;</td>
                                  </tr>
                                </table> <!--[if mso | IE]> </td>
                            </tr>
                          </table> <![endif]--> </div>
                        <div class="row">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="700" style="padding: 0 10px;width: 100%" align="left" valign="top">
                                <p class="email-footer text p" style="display: block; font-family: Helvetica,Arial,sans-serif; line-height: 20px; padding: 16px 8px; background-color: #F3F4F6; border-radius: 4px; color: #044E3B; font-size: 12px; margin: 0;">&copy; Tkachuk Massage Therapy</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table> <!--[if mso | IE]> </td>
              </tr>
            </table> <![endif]--> </div>
        </td>
      </tr>
    </table>
    <div style="display:none; white-space:nowrap; font-size:15px; line-height:0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
  </body>
</html>`;
};

export function renderBookingSlotsForEmail(
  slots: IBookingSlotWithProduct[]
): string {
  if (!slots || slots.length === 0) {
    return "<p>No booking slots available.</p>";
  }

  const listItems = slots
    .map(
      (slot) => `
        <li style="display:block; margin-bottom: 8px">
          <strong>${slot.productTitle}</strong><br/>
          Price: €${slot.productPrice.toFixed(2)}<br/>
          From: ${new Date(slot.start).toLocaleString("de-AT")}<br/>
          To: ${new Date(slot.end).toLocaleString("de-AT")}<br/>
        </li>
      `
    )
    .join("");

  return `<ul>${listItems}</ul>`;
}
/* eslint-enable indent */
