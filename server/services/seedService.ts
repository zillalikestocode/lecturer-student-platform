import User from "../models/User";
import Chat from "../models/Chat";

// Seed initial data if needed (for development)
export const seedData = async () => {
  try {
    // Check if users exist
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log("Seeding initial data...");

      // Create default users
      const lecturer1 = await User.create({
        name: "Dr. Smith",
        email: "smith@example.com",
        password: "password123",
        role: "lecturer",
      });

      const lecturer2 = await User.create({
        name: "Dr. Johnson",
        email: "johnson@example.com",
        password: "password123",
        role: "lecturer",
      });

      const student1 = await User.create({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        role: "student",
      });

      const student2 = await User.create({
        name: "Bob",
        email: "bob@example.com",
        password: "password123",
        role: "student",
      });

      const student3 = await User.create({
        name: "Charlie",
        email: "charlie@example.com",
        password: "password123",
        role: "student",
      });

      // Create default chats
      const chat1 = await Chat.create({
        name: "CS101 General Chat",
        participants: [lecturer1._id, student1._id, student2._id, student3._id],
        isGroupChat: true,
      });

      const chat2 = await Chat.create({
        name: "Physics 202 Discussion",
        participants: [lecturer2._id, student1._id, student2._id],
        isGroupChat: true,
      });

      console.log("Initial data seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
