import Mailgun from "mailgun.js";
import formData from "form-data";
import { Response } from "express";

export class Mailer {
  private mailgun: any;
  private mg: any;

  constructor() {
    this.mailgun = new Mailgun(formData);
    this.mg = this.mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
      url: "https://api.eu.mailgun.net",
    });
  }

  public async sendEmail(
    recipients: string[],
    subject: string,
    body: string,
    attachment: any = null
  ): Promise<Boolean> {
    try {
      console.log("Sending email to", attachment);
      
      const { status } = await this.mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        {
          from: "Game Market <no-reply@game-market-esgi-s2-4iw.world>",
          to: [...recipients],
          subject,
          text: body,
          attachment
        }
      );

      if (status !== 200) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}
