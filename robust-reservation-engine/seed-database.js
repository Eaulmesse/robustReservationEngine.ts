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
  
  // 2. Créer des users qui seront providers (avec description et address)
  console.log("🏢 Création des users-providers...");
  
  const coiffeurResult = await request("POST", "/auth/register", {
    email: "coiffeur@elegance.fr",
    firstName: "Sophie",
    lastName: "Coiffure",
    password: "password123",
    role: "CLIENT",
    phone: "+33145678901",
    description: "Salon de coiffure moderne au cœur de Paris",
    address: "15 Rue de la Paix, 75002 Paris"
  });
  const coiffeur = coiffeurResult?.user;
  console.log("✅ Coiffeur créé:", coiffeur?.firstName, coiffeur?.lastName);
  
  const medecinResult = await request("POST", "/auth/register", {
    email: "dr.bertrand@medicale.fr",
    firstName: "Sophie",
    lastName: "Bertrand",
    password: "password123",
    role: "CLIENT",
    phone: "+33156789012",
    description: "Médecin généraliste, consultations sur rendez-vous",
    address: "42 Avenue des Champs-Élysées, 75008 Paris"
  });
  const medecin = medecinResult?.user;
  console.log("✅ Médecin créé:", medecin?.firstName, medecin?.lastName);
  
  const garageResult = await request("POST", "/auth/register", {
    email: "garage@autoplus.fr",
    firstName: "Jean",
    lastName: "Garage",
    password: "password123",
    role: "CLIENT",
    phone: "+33167890123",
    description: "Réparation et entretien automobile",
    address: "78 Boulevard Périphérique, 75015 Paris"
  });
  const garage = garageResult?.user;
  console.log("✅ Garage créé:", garage?.firstName, garage?.lastName);
  
  if (!coiffeur || !medecin || !garage) {
    console.error("❌ Erreur lors de la création des providers");
    return;
  }
  
  // 3. Créer des clients normaux
  console.log("\n👥 Création des clients...");
  
  const usersData = [
    { email: "jean.dupont@email.com", firstName: "Jean", lastName: "Dupont", password: "password123", phone: "+33612345678" },
    { email: "marie.martin@email.com", firstName: "Marie", lastName: "Martin", password: "password123", phone: "+33687654321" },
    { email: "pierre.durand@email.com", firstName: "Pierre", lastName: "Durand", password: "password123", phone: "+33698765432" }
  ];
  
  const clients = [];
  for (const userData of usersData) {
    const result = await request("POST", "/auth/register", {
      ...userData,
      role: "CLIENT"
    });
    if (result?.user) {
      clients.push(result.user);
      console.log(`✅ Client créé: ${result.user.firstName} ${result.user.lastName}`);
    }
  }
  
  // 4. Créer des availabilities pour les providers
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
  
  if (clients.length >= 3) {
    // RDV Coiffeur
    await request("POST", "/appointments", {
      userId: clients[0].id,
      providerId: coiffeur.id,
      startTime: "2026-01-27T10:00:00Z",
      endTime: "2026-01-27T10:30:00Z",
      status: "CONFIRMED",
      notes: "Coupe + brushing"
    }, TOKEN);
    console.log("✅ RDV coiffeur créé");
    
    // RDV Médecin
    await request("POST", "/appointments", {
      userId: clients[1].id,
      providerId: medecin.id,
      startTime: "2026-01-27T15:00:00Z",
      endTime: "2026-01-27T15:20:00Z",
      status: "PENDING",
      notes: "Consultation générale"
    }, TOKEN);
    console.log("✅ RDV médecin créé");
    
    // RDV Garage
    await request("POST", "/appointments", {
      userId: clients[2].id,
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
  console.log(`   - 3 Users-Providers créés (peuvent recevoir des RDV)`);
  console.log(`   - ${clients.length} Clients créés (peuvent prendre des RDV)`);
  console.log(`   - 12 Availabilities créées`);
  console.log(`   - 3 Appointments créés`);
  console.log("\n🔑 Identifiants admin:");
  console.log(`   Email: admin@reservation.com`);
  console.log(`   Password: admin123`);
  console.log("\n🔑 Identifiants providers:");
  console.log(`   Email: coiffeur@elegance.fr / Password: password123`);
  console.log(`   Email: dr.bertrand@medicale.fr / Password: password123`);
  console.log(`   Email: garage@autoplus.fr / Password: password123`);
  console.log("\n🔑 Identifiants clients:");
  console.log(`   Email: jean.dupont@email.com / Password: password123`);
  console.log(`   Email: marie.martin@email.com / Password: password123`);
  console.log(`   Email: pierre.durand@email.com / Password: password123`);
}

seedDatabase().catch(console.error);
