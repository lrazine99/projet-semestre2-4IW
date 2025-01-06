import express, { Router, Request, Response } from "express";
import { UserService } from "../services/mongoose/models";
import { MongooseService } from "../services";

export class StatsController {
    private userService!: UserService;
  
    constructor() {
      this.initialize();
    }
  
    private async initialize() {
      const mongooseService = await MongooseService.get();
      this.userService = mongooseService.userService;
    }
  
    private async getNewUserStats(req: Request, res: Response) {
      const { period = 'day' } = req.query;
    
      if (!['day', 'month', 'year'].includes(period as string)) {
        return res.status(400).json({ message: "La période doit être 'day', 'month' ou 'year'." });
      }
    
      try {
        const startDate = this.calculateStartDate(period as string);
        
        if (!this.userService) {
          return res.status(503).json({ message: "Service non initialisé." });
        }
    
        const stats = await this.getUserStats(startDate, period as string);
    
        return res.set('Content-Type', 'application/json').status(200).json({ stats });
      } catch (error) {
        console.error('Erreur dans getNewUserStats:', error);
        return res.status(500).json({ 
          message: "Erreur lors de la récupération des statistiques des utilisateurs.",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  
    private calculateStartDate(period: string): Date {
      const now = new Date();
      const startDate = new Date();
  
      switch (period) {
        case 'year':
          startDate.setFullYear(now.getFullYear() - 15);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 15);
          break;
        case 'day':
          startDate.setDate(now.getDate() - 15);
          break;
      }
  
      // Reset time to start of day
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    }
  
    private async getUserStats(startDate: Date, period: string) {
      if (!this.userService?.model) {
        throw new Error("UserService model not initialized");
      }
  
      let dateFormat: string;
      let groupId: any;
      
      switch (period) {
        case 'year':
          dateFormat = "%Y";
          groupId = { $dateToString: { format: "%Y", date: "$birthDate" } };
          break;
        case 'month':
          dateFormat = "%Y-%m";
          groupId = { $dateToString: { format: "%Y-%m", date: "$birthDate" } };
          break;
        default:
          dateFormat = "%Y-%m-%d";
          groupId = { $dateToString: { format: "%Y-%m-%d", date: "$birthDate" } };
      }
  
      const stats = await this.userService.model.aggregate([
        {
          $match: {
            birthDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: groupId,
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
  
      return this.fillMissingPeriods(stats, startDate, period);
    }
  
    private fillMissingPeriods(stats: any[], startDate: Date, period: string) {
      const result = [];
      const endDate = new Date();
      let currentDate = new Date(startDate);
  
      while (currentDate <= endDate) {
        let dateStr;
        switch (period) {
          case 'year':
            dateStr = currentDate.getFullYear().toString();
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
          case 'month':
            dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          default:
            dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            currentDate.setDate(currentDate.getDate() + 1);
        }
  
        const existingStat = stats.find(s => s._id === dateStr);
        result.push({
          date: dateStr,
          userCount: existingStat ? existingStat.count : 0
        });
      }
  
      return result;
    }
  
    public buildRouter(): Router {
      const router = Router();
      
      router.get("/new-users", async (req, res) => {
        await this.getNewUserStats(req, res);
      });
  
      return router;
    }
  }