import { MongooseService } from "./mongoose.service";
import { IPlatform } from "../../types";

abstract class FixturesService {
  static async loadPlatforms() {
    const mongooseService = await MongooseService.get();
    const Platform = mongooseService.platformService.model;

    await Platform.deleteMany({});

    const platforms = [
      { name: "PlayStation 5" },
      { name: "Xbox Series X" },
      { name: "Nintendo Switch" },
      { name: "PC" },
    ];

    try {
      await Platform.insertMany(platforms);
      console.log("Platforms inserted successfully");
    } catch (error) {
      console.error("Error inserting platforms:", error);
    }

    return;
  }

  static async loadProducts() {
    const mongooseService = await MongooseService.get();
    const Platform = mongooseService.platformService.model;
    const Product = mongooseService.productService.model;

    await Product.deleteMany({});

    const platforms: IPlatform[] = await Platform.find();

    const games = [
      {
        name: "Game 1",
        description: "An action-packed adventure",
        genres: ["Action"],
        minAge: 16,
        editor: "EpicGames",
        variants: platforms.map((platform, index) => {
          const generateEAN = () => {
            return Math.floor(Math.random() * 10000000000000);
          };
          return {
            _id: new mongooseService.mongoose.Types.ObjectId(),
            sku: `SKU001${index}`,
            platform: platform._id,
            name: "Standard Edition",
            edition: "Standard",
            price: 49.99,
            stock: 100,
            releaseDate: new Date("2023-01-01"),
            images: [
              "https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw5e1dfb6c/images/high-res/2024_Gaming/PS5/Jeux/PS5_HZDR_PKSHT_FT_RGB_FR_240918.jpg",
            ],
            barcode: generateEAN(),
          };
        }),
      },
      {
        name: "Game 2",
        description: "An epic adventure game",
        genres: ["Adventure", "Voiture"],
        minAge: 7,
        editor: "Ubisoft",
        variants: platforms.map((platform, index) => {
          const generateEAN = () => {
            return Math.floor(Math.random() * 10000000000000);
          };
          return {
            _id: new mongooseService.mongoose.Types.ObjectId(),
            sku: `SKU002${index}`,
            platform: platform._id,
            name: "Standard Edition",
            edition: "Standard",
            price: 39.99,
            stock: 100,
            releaseDate: new Date("2023-01-01"),
            images: [
              "https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw7fcd69b3/images/high-res/2024_Gaming/PS5/Jeux/241354.jpg",
            ],
            barcode: generateEAN(),
          };
        }),
      },
      {
        name: "Game 3",
        description:
          "A thrilling horror experience for strong boys with a big mind",
        genres: ["Horror"],
        minAge: 18,
        editor: "2k",
        variants: platforms.map((platform, index) => {
          const generateEAN = () => {
            return Math.floor(Math.random() * 10000000000000);
          };
          return {
            _id: new mongooseService.mongoose.Types.ObjectId(),
            sku: `SKU003${index}`,
            platform: platform._id,
            name: "Deluxe Edition",
            edition: "Deluxe",
            price: 59.99,
            stock: 50,
            releaseDate: new Date("2023-06-01"),
            images: [
              "https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dwdda88e49/images/high-res/2024_Gaming/PS5/Jeux/BO6/0196388432127.jpg",
            ],
            barcode: generateEAN(),
          };
        }),
      },
      {
        name: "Game 4",
        description: "A fun multiplayer racing game",
        genres: ["Racing", "Multiplayer"],
        minAge: 16,
        editor: "Voodoo",
        variants: platforms.map((platform, index) => {
          const generateEAN = () => {
            return Math.floor(Math.random() * 10000000000000);
          };
          return {
            _id: new mongooseService.mongoose.Types.ObjectId(),
            sku: `SKU004${index}`,
            platform: platform._id,
            name: "Collector's Edition",
            edition: "Collector's",
            price: 69.99,
            stock: 25,
            releaseDate: new Date("2023-09-01"),
            images: [
              "https://www.micromania.fr/dw/image/v2/BCRB_PRD/on/demandware.static/-/Sites-masterCatalog_Micromania/default/dw967b4634/images/high-res/142715.jpg",
            ],
            barcode: generateEAN(),
          };
        }),
      },
    ];

    try {
      await Product.insertMany(games);

      console.log("Games inserted successfully");
    } catch (error) {
      console.error("Error inserting games:", error);
    }
    return;
  }

  static async loadUsers() {
    const mongooseService = await MongooseService.get();
    const User = mongooseService.userService.model;

    await User.deleteMany({});

    const users = [
      {
        firstName: "Louafi",
        lastName: "Razine",
        email: "louafi.style@gmail.com",
        address: {
          number: 10,
          street: "rue des Lilas",
          complement: "Appartement 42",
          zipCode: "75000",
          city: "Paris",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2024-12-31"),
        token: "J3M5-TyCKjbgH8-b",
        hash: "Ok29HXvmHUP6ZS5TT5317E4WBMsMd8gRRQUsreekH2E=",
        salt: "lnlPpFp24-lG",
        isVerified: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        firstName: "Alice",
        lastName: "Doe",
        email: "alice.doe@example.com",
        address: {
          number: 25,
          street: "avenue des Champs",
          complement: "",
          zipCode: "69000",
          city: "Lyon",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2024-12-31"),
        token: "A1B2-C3D4E5F6G7H8I9",
        hash: "Yw9O9HeVmHUAbd2ZS5Tr3174WVMsd8FF8RtQrsEEKH3L=",
        salt: "azrLpXp78-cD",
        isVerified: false,
        confirmationToken: "randomConfirmationToken123",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        address: {
          number: 12,
          street: "rue de la Paix",
          complement: "Bâtiment B",
          zipCode: "13000",
          city: "Marseille",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-12-30"),
        token: "B3N2-D4K6L7H8T9J0",
        hash: "Pl20KYsmVHP5ZS3LRj824FVJMsd8PFA9RaQsrsFKH4M=",
        salt: "bznLpXp89-zD",
        isVerified: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        firstName: "Emily",
        lastName: "Watson",
        email: "emily.watson@example.com",
        address: {
          number: 7,
          street: "boulevard Saint-Michel",
          complement: "",
          zipCode: "75006",
          city: "Paris",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-11-31"),
        token: "K8M6-F3N5B4T6G7H8",
        hash: "Tk30EYnmGHQ5ZK8LRj824HVJMsd8EFA9SaQsrsXKH5M=",
        salt: "czrLpFp88-xE",
        isVerified: false,
        confirmationToken: "randomConfirmationToken456",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Liam",
        lastName: "Johnson",
        email: "liam.johnson@example.com",
        address: {
          number: 45,
          street: "rue de l'Église",
          complement: "1er étage",
          zipCode: "31000",
          city: "Toulouse",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2023-12-31"),
        token: "L9N8-F2K7B3T5G6H7",
        hash: "Xw30FYlnIHU8ZX5MRj124HVLMsd8CFA0UaQsrsZKH6M=",
        salt: "dzrLpXp66-wD",
        isVerified: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        firstName: "Sophia",
        lastName: "Brown",
        email: "sophia.brown@example.com",
        address: {
          number: 78,
          street: "rue Lafayette",
          complement: "",
          zipCode: "75009",
          city: "Paris",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-12-27"),
        token: "M3K7-B2N8F4T6G7H9",
        hash: "Qk40LYqnFHU9ZX5NRj424HVMMsd8EFA1VaQsrsZKH7M=",
        salt: "ezrLpXp77-yD",
        isVerified: false,
        confirmationToken: "randomConfirmationToken789",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "James",
        lastName: "Williams",
        email: "james.williams@example.com",
        address: {
          number: 5,
          street: "rue des Alpes",
          complement: "",
          zipCode: "38000",
          city: "Grenoble",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-11-11"),
        token: "N6K8-B5M3T7G2F4H8",
        hash: "Ak50MYrnJHU7YX5QRj224HVNMsd8DFA2WaQsrsYKH8M=",
        salt: "fzrLpXp88-zF",
        isVerified: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        firstName: "Olivia",
        lastName: "Jones",
        email: "olivia.jones@example.com",
        address: {
          number: 89,
          street: "avenue des Fleurs",
          complement: "Villa 12",
          zipCode: "06200",
          city: "Nice",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-12-28"),
        token: "T5K7-B8N6F3G2H9M4",
        hash: "Zk60NYsnKHQ6ZY5ORj524HVOMsd8GFA3XaQsrsZKH9M=",
        salt: "gzrLpXp99-xE",
        isVerified: false,
        confirmationToken: "randomConfirmationToken012",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Noah",
        lastName: "Davis",
        email: "noah.davis@example.com",
        address: {
          number: 15,
          street: "rue des Écoles",
          complement: "",
          zipCode: "44000",
          city: "Nantes",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-12-26"),
        token: "H3T6-B7K8F2M4G9N5",
        hash: "Bk70LYtnKHQ8ZY5PRj724HVPMsd8HFA4XaQsrsAKH0M=",
        salt: "hzrLpXp88-yD",
        isVerified: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        firstName: "Ava",
        lastName: "Garcia",
        email: "ava.garcia@example.com",
        address: {
          number: 33,
          street: "avenue Victor Hugo",
          complement: "Résidence A",
          zipCode: "75016",
          city: "Paris",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2022-12-31"),
        token: "G9T4-B6K8F7M3N5H2",
        hash: "Ck80OYvnLHJ9ZY5QRj824HVRMsd8JFA5ZaQsrsZLH1M=",
        salt: "izrLpXp77-wC",
        isVerified: false,
        confirmationToken: "randomConfirmationToken345",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Liam",
        lastName: "Smith",
        email: "liam.smith@example.com",
        address: {
          number: 12,
          street: "boulevard de la République",
          complement: "Appartement 102",
          zipCode: "75011",
          city: "Paris",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-09-31"),
        token: "D5S3-G9H1T8R7V2X6",
        hash: "NkU7TY5Zm7nWLhVgL1l1zZ1UByp9QHjMkX-0LqfK8=",
        salt: "K4Ht5xMzNv-u",
        isVerified: true,
        confirmationToken: "randomConfirmationToken987",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Olivia",
        lastName: "Martinez",
        email: "olivia.martinez@example.com",
        address: {
          number: 58,
          street: "rue de la Paix",
          complement: "Bâtiment B",
          zipCode: "75002",
          city: "Paris",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2024-10-31"),
        token: "F7P2-A6V4B9J1P3S5",
        hash: "P5QfHkJ3Zl4SsdQ2kZTjvOqGh5Fqql5f8ayF5LRwkA==",
        salt: "Q2TjV50zM9-l",
        isVerified: true,
        confirmationToken: "randomConfirmationToken123",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Ethan",
        lastName: "Johnson",
        email: "ethan.johnson@example.com",
        address: {
          number: 45,
          street: "rue des Champs",
          complement: "Appartement 305",
          zipCode: "75008",
          city: "Paris",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2014-12-31"),
        token: "Z8S2-V4Q6J3F9K2L8",
        hash: "NzFkTG1nR7DJ6FOxHLjRoURMYK23h5QghF9g7uYwFY5=",
        salt: "K2pR3Tg2-M5n",
        isVerified: false,
        confirmationToken: "randomConfirmationToken654",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Mia",
        lastName: "Williams",
        email: "mia.williams@example.com",
        address: {
          number: 89,
          street: "avenue des Ternes",
          complement: "Résidence C",
          zipCode: "75017",
          city: "Paris",
          country: "France",
        },
        role: "admin",
        birthDate: new Date("2018-12-31"),
        token: "P4F1-D9S5M3X2K4B9",
        hash: "M5Y6xJ4sqaAWkq9Kp0dHl2B8Y-3INm78kFu8Ae5gEXI=",
        salt: "G2sTm1J9-B5o",
        isVerified: true,
        confirmationToken: "randomConfirmationToken789",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
      {
        firstName: "Sophia",
        lastName: "Brown",
        email: "sophia.brown2@example.com",
        address: {
          number: 21,
          street: "rue de la Concorde",
          complement: "Studio 7",
          zipCode: "75009",
          city: "Paris",
          country: "France",
        },
        role: "user",
        birthDate: new Date("2024-12-25"),
        token: "K1R6-E7W9B2F8V4M5",
        hash: "X3ZmBxzLrl9Cm9Xj9vq1B9jGxMTNK4IU7cFS9HauDA0=",
        salt: "Z9tPpL6x-I0r",
        isVerified: false,
        confirmationToken: "randomConfirmationToken432",
        confirmationTokenExpires: new Date(Date.now() + 3600000),
      },
    ];

    try {
      await User.insertMany(users);
      console.log("Users inserted successfully");
    } catch (error) {
      console.error("Error inserting users:", error);
    }
  }
}

export const loadFixtures = async () => {
  await FixturesService.loadPlatforms();
  await FixturesService.loadProducts();
  await FixturesService.loadUsers();
  return;
};
