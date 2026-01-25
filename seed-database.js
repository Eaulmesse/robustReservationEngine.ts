const API_URL = "http://localhost:3000";

async function request(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    }
  };
  
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const result = await response.json();
  
  if (!response.ok) {
    console.error(`❌ Erreur ${method} ${endpoint}:`, result);
    return null;
  }
  
  return result;
}

async function seedDatabase() {
  console.log("🌱 Début du seed de la base de données...\n");
  
  // 1. Créer un admin
  console.log("👤 Création de l'admin...");
  const adminResult = await request("POST", "/auth/register", {
    email: "admin@reservation.com",
    firstName: "Admin",
    lastName: "System",
    password: "admin123",
    role: "ADMIN"
  });
  
  if (!adminResult) {
    console.error("❌ Impossible de créer l'admin");
    return;
  }
  
  const TOKEN = adminResult.access_token;
  console.log("✅ Admin créé et connecté\n");
  
  // 2. Créer des users clients
  console.log("👥 Création des clients...");
  
  const usersData = [
    { email: "jean.dupont@email.com", firstName: "Jean", lastName: "Dupont", password: "password123", phone: "+33612345678" },
    { email: "marie.martin@email.com", firstName: "Marie", lastName: "Martin", password: "password123", phone: "+33687654321" },
    { email: "pierre.durand@email.com", firstName: "Pierre", lastName: "Durand", password: "password123", phone: "+33698765432" }
  ];
  
  const users = [];
  for (const userData of usersData) {
    const result = await request("POST", "/auth/register", {
      ...userData,
      role: "CLIENT"
    });
    if (result?.user) {
      users.push(result.user);
      console.log(`✅ Client créé: ${result.user.firstName} ${result.user.lastName}`);
    }
  }
  
  // 3. Créer des providers
  console.log("\n🏢 Création des providers...");
  
  const coiffeur = await request("POST", "/providers", {
    name: "Salon Élégance",
    email: "contact@elegance-coiffure.fr",
    description: "Salon de coiffure moderne au cœur de Paris",
    phone: "+33145678901",
    address: "15 Rue de la Paix, 75002 Paris",
    isActive: true
  }, TOKEN);
  console.log("✅ Coiffeur créé:", coiffeur?.name);
  
  const medecin = await request("POST", "/providers", {
    name: "Dr. Sophie Bertrand",
    email: "dr.bertrand@medicale.fr",
    description: "Médecin généraliste, consultations sur rendez-vous",
    phone: "+33156789012",
    address: "42 Avenue des Champs-Élysées, 75008 Paris",
    isActive: true
  }, TOKEN);
  console.log("✅ Médecin créé:", medecin?.name);
  
  const garage = await request("POST", "/providers", {
    name: "Garage AutoPlus",
    email: "garage.autoplus@email.fr",
    description: "Réparation et entretien automobile",
    phone: "+33167890123",
    address: "78 Boulevard Périphérique, 75015 Paris",
    isActive: true
  }, TOKEN);
  console.log("✅ Garage créé:", garage?.name);
  
  if (!coiffeur || !medecin || !garage) {
    console.error("❌ Erreur lors de la création des providers");
    return;
  }
  
  // 4. Créer des availabilities
  console.log("\n📅 Création des disponibilités...");
  
  // Coiffeur - Lundi à Vendredi
  const daysCoiffeur = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  for (const day of daysCoiffeur) {
    await request("POST", "/availabilities", {
      providerId: coiffeur.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 30,
      isRecurring: true,
      isActive: true
    }, TOKEN);
  }
  console.log("✅ Disponibilités coiffeur créées (Lun-Ven 9h-18h)");
  
  // Médecin - Lundi, Mercredi, Vendredi
  const daysMedecin = ["MONDAY", "WEDNESDAY", "FRIDAY"];
  for (const day of daysMedecin) {
    await request("POST", "/availabilities", {
      providerId: medecin.id,
      dayOfWeek: day,
      startTime: "14:00",
      endTime: "19:00",
      slotDuration: 20,
      isRecurring: true,
      isActive: true
    }, TOKEN);
  }
  console.log("✅ Disponibilités médecin créées (Lun-Mer-Ven 14h-19h)");
  
  // Garage - Mardi et Jeudi
  const daysGarage = ["TUESDAY", "THURSDAY"];
  for (const day of daysGarage) {
    await request("POST", "/availabilities", {
      providerId: garage.id,
      dayOfWeek: day,
      startTime: "08:00",
      endTime: "17:00",
      slotDuration: 60,
      isRecurring: true,
      isActive: true
    }, TOKEN);
  }
  console.log("✅ Disponibilités garage créées (Mar-Jeu 8h-17h)");
  
  // 5. Créer des appointments
  console.log("\n📆 Création de rendez-vous...");
  
  if (users.length >= 3) {
    // RDV Coiffeur
    await request("POST", "/appointments", {
      userId: users[0].id,
      providerId: coiffeur.id,
      startTime: "2026-01-27T10:00:00Z",
      endTime: "2026-01-27T10:30:00Z",
      status: "CONFIRMED",
      notes: "Coupe + brushing"
    }, TOKEN);
    console.log("✅ RDV coiffeur créé");
    
    // RDV Médecin
    await request("POST", "/appointments", {
      userId: users[1].id,
      providerId: medecin.id,
      startTime: "2026-01-27T15:00:00Z",
      endTime: "2026-01-27T15:20:00Z",
      status: "PENDING",
      notes: "Consultation générale"
    }, TOKEN);
    console.log("✅ RDV médecin créé");
    
    // RDV Garage
    await request("POST", "/appointments", {
      userId: users[2].id,
      providerId: garage.id,
      startTime: "2026-01-28T09:00:00Z",
      endTime: "2026-01-28T10:00:00Z",
      status: "CONFIRMED",
      notes: "Révision complète"
    }, TOKEN);
    console.log("✅ RDV garage créé");
  }
  
  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n📊 Résumé:");
  console.log(`   - 1 Admin créé`);
  console.log(`   - ${users.length} Clients créés`);
  console.log(`   - 3 Providers créés`);
  console.log(`   - 12 Availabilities créées`);
  console.log(`   - 3 Appointments créés`);
  console.log("\n🔑 Identifiants admin:");
  console.log(`   Email: admin@reservation.com`);
  console.log(`   Password: admin123`);
  console.log("\n🔑 Identifiants clients:");
  console.log(`   Email: jean.dupont@email.com / Password: password123`);
  console.log(`   Email: marie.martin@email.com / Password: password123`);
  console.log(`   Email: pierre.durand@email.com / Password: password123`);
}

seedDatabase().catch(console.error);
