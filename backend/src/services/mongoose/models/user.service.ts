import { Model } from "mongoose";
import { MongooseService } from "../mongoose.service";
import { UserSchema } from "../schema";
import { IUser } from "../../../types";
import { Mailer } from "../../../helpers/mailer";
import uid2 from "uid2";
// Omit permet d'enlever des clés d'un type pour en creer un nouveau
// export type CreateUser = Omit<IUser, "_id" | "createdAt" | "updatedAt">;

export class UserService {
  readonly mongooseService: MongooseService;
  readonly model: Model<IUser>;

  constructor(mongooseService: MongooseService) {
    this.mongooseService = mongooseService;
    const mongoose = this.mongooseService.mongoose;
    this.model = mongoose.model("User", UserSchema);
  }

  async sendConfirmationEmail(user: IUser) {
    const confirmationToken = uid2(16);

    user.confirmationToken = confirmationToken;
    user.confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    const newMailer = new Mailer();
    const confirmationLink = `http://localhost/confirmer-votre-compte/${confirmationToken}`;

    return newMailer.sendEmail(
      [user.email],
      "Confirmer votre compte",
      `Vous avez 24 heures pour confirmer votre compte en cliquant sur le lien suivant: ${confirmationLink}`
    );
    
  }

  /*

  async createUser(user: CreateUser): Promise<IUser> {
    const res = await this.model.create(user);
    return res;
  }

  async findUser(email: string, password: string): Promise<IUser | null> {
    const user = await this.model.findOne({
      email: email,
      password: password,
    });
    // findOne permet de récuperer 1 enregistrement avec le filtre
    // la condition du filtre utilise un AND entre chaque champs
    return user;
  }

  */
}
