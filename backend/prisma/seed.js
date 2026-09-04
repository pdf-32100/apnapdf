import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import env from "../src/config/env.js";

const prisma = new PrismaClient();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding database…");

  // Admin user
  const passwordHash = await bcrypt.hash(env.admin.password, 10);
  const admin = await prisma.user.upsert({
    where: { email: env.admin.email },
    update: { role: "ADMIN", passwordHash, name: env.admin.name },
    create: {
      name: env.admin.name,
      email: env.admin.email,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`  Admin: ${admin.email} / ${env.admin.password}`);

  // A demo customer
  await prisma.user.upsert({
    where: { email: "customer@printwala.test" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@printwala.test",
      phone: "9876543210",
      passwordHash: await bcrypt.hash("customer123", 10),
      role: "USER",
    },
  });

  // Categories
  const categoryNames = ["Printing & Copy", "Documentation", "Design", "Government Services"];
  const categories = {};
  for (const name of categoryNames) {
    const c = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categories[name] = c;
  }

  // Services
  const services = [
    {
      title: "Photocopy / PDF Printing",
      shortDesc: "Upload a PDF and get crisp printed copies delivered.",
      description:
        "Upload any PDF and we'll print it exactly the way you need — black & white or colour, single or double sided. Choose the number of copies, pick your paper size, and we'll have it ready. Perfect for assignments, notes, forms and official documents.",
      price: 5, // ₹5 per copy
      category: "Printing & Copy",
      featured: true,
      requiresUpload: true,
      uploadLabel: "Upload the PDF you want printed",
      imageUrl:
        "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "copies", label: "Number of copies", type: "number", required: true, placeholder: "e.g. 10" },
        { name: "color", label: "Colour", type: "select", required: true, options: ["Black & White", "Colour"] },
        { name: "sides", label: "Printing", type: "select", required: true, options: ["Single sided", "Double sided"] },
        { name: "paper", label: "Paper size", type: "select", required: true, options: ["A4", "A3", "Letter"] },
        { name: "binding", label: "Binding", type: "select", required: false, options: ["None", "Spiral", "Stapled"] },
        { name: "instructions", label: "Special instructions", type: "textarea", required: false, placeholder: "Anything we should know?" },
      ],
    },
    {
      title: "Passport Size Photos",
      shortDesc: "Studio-quality passport photos, print + digital copy.",
      description:
        "Get professional passport / visa size photographs with the correct background and dimensions. Upload your photo or book a studio slot. Includes a set of prints plus a digital copy that meets official requirements.",
      price: 80,
      category: "Printing & Copy",
      featured: true,
      requiresUpload: true,
      uploadLabel: "Upload a clear front-facing photo (optional)",
      imageUrl:
        "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "quantity", label: "Number of prints", type: "select", required: true, options: ["8 prints", "16 prints", "32 prints"] },
        { name: "size", label: "Photo size", type: "select", required: true, options: ["Passport (35x45mm)", "Visa (2x2 inch)", "Stamp size"] },
        { name: "background", label: "Background colour", type: "select", required: true, options: ["White", "Blue", "Red"] },
      ],
    },
    {
      title: "Resume / CV Design",
      shortDesc: "A recruiter-ready resume designed by hand.",
      description:
        "Share your details and we'll craft a clean, modern, ATS-friendly resume tailored to your target role. Two rounds of revisions included. Delivered as an editable document and a print-ready PDF.",
      price: 299,
      category: "Design",
      featured: true,
      requiresUpload: true,
      uploadLabel: "Upload your current resume or details (optional)",
      imageUrl:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "role", label: "Target role / job title", type: "text", required: true, placeholder: "e.g. Frontend Developer" },
        { name: "experience", label: "Years of experience", type: "number", required: false },
        { name: "template", label: "Preferred style", type: "select", required: false, options: ["Minimal", "Modern", "Creative", "Corporate"] },
        { name: "notes", label: "Anything you'd like to highlight", type: "textarea", required: false },
      ],
    },
    {
      title: "Lamination",
      shortDesc: "Protect certificates and documents with a glossy finish.",
      description:
        "Laminate your certificates, ID cards and important documents for long-lasting protection. Available in gloss and matte finish across common sizes.",
      price: 20,
      category: "Documentation",
      featured: false,
      requiresUpload: false,
      imageUrl:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "size", label: "Document size", type: "select", required: true, options: ["ID card", "A5", "A4", "A3"] },
        { name: "finish", label: "Finish", type: "select", required: true, options: ["Glossy", "Matte"] },
        { name: "quantity", label: "How many?", type: "number", required: true },
      ],
    },
    {
      title: "PAN Card Application",
      shortDesc: "New PAN or corrections — we handle the paperwork.",
      description:
        "Assistance with new PAN card applications and corrections. Upload your documents and we'll fill and submit the application on your behalf. Government fees included.",
      price: 150,
      category: "Government Services",
      featured: false,
      requiresUpload: true,
      uploadLabel: "Upload ID & address proof (PDF/JPG)",
      imageUrl:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "applicationType", label: "Application type", type: "select", required: true, options: ["New PAN", "Correction / Reprint"] },
        { name: "fullName", label: "Full name (as on ID)", type: "text", required: true },
        { name: "dob", label: "Date of birth", type: "date", required: true },
      ],
    },
    {
      title: "Business Card Printing",
      shortDesc: "Premium business cards, designed and printed.",
      description:
        "Stand out with professionally designed business cards on premium stock. Share your details or an existing design and choose your quantity and finish.",
      price: 249,
      category: "Design",
      featured: false,
      requiresUpload: true,
      uploadLabel: "Upload your logo / existing design (optional)",
      imageUrl:
        "https://images.unsplash.com/photo-1589041027557-b64e4e58f8db?auto=format&fit=crop&w=1200&q=80",
      fields: [
        { name: "quantity", label: "Quantity", type: "select", required: true, options: ["100 cards", "250 cards", "500 cards", "1000 cards"] },
        { name: "finish", label: "Finish", type: "select", required: true, options: ["Matte", "Glossy", "Textured"] },
        { name: "company", label: "Company name", type: "text", required: true },
        { name: "details", label: "Details to print", type: "textarea", required: true, placeholder: "Name, title, phone, email, address…" },
      ],
    },
  ];

  for (const s of services) {
    const cat = categories[s.category];
    await prisma.service.upsert({
      where: { slug: slugify(s.title) },
      update: {
        shortDesc: s.shortDesc,
        description: s.description,
        price: s.price * 100,
        imageUrl: s.imageUrl,
        featured: s.featured,
        requiresUpload: s.requiresUpload,
        uploadLabel: s.uploadLabel || "Upload your file",
        categoryId: cat.id,
        fields: s.fields,
      },
      create: {
        slug: slugify(s.title),
        title: s.title,
        shortDesc: s.shortDesc,
        description: s.description,
        price: s.price * 100,
        imageUrl: s.imageUrl,
        active: true,
        featured: s.featured,
        requiresUpload: s.requiresUpload,
        uploadLabel: s.uploadLabel || "Upload your file",
        categoryId: cat.id,
        fields: s.fields,
      },
    });
  }
  console.log(`  ${services.length} services seeded.`);

  // Site content
  const content = {
    settings: {
      siteName: "PrintWala",
      tagline: "Print Your Ideas",
      email: "hello@printwala.test",
      phone: "+91 98765 43210",
      address: "12 MG Road, Bengaluru, Karnataka 560001",
      hours: "Mon–Sat, 9:00 AM – 8:00 PM",
      social: { instagram: "", facebook: "", whatsapp: "919876543210" },
    },
    home: {
      heroTitle: "Print, design & paperwork — sorted in a few clicks",
      heroSubtitle:
        "Upload your files, tell us what you need, and pay online. We handle the rest and have it ready for you — no queues, no hassle.",
      heroCta: "Browse services",
      heroImage:
        "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1600&q=80",
      stats: [
        { label: "Orders delivered", value: "12,000+" },
        { label: "Happy customers", value: "4,500+" },
        { label: "Avg. turnaround", value: "2 hrs" },
      ],
      steps: [
        { title: "Pick a service", text: "Choose from printing, design, documentation and more." },
        { title: "Fill the details", text: "Tell us what you need and upload your files." },
        { title: "Pay securely", text: "Checkout online with UPI, cards or netbanking." },
        { title: "We deliver", text: "Track your order and collect or receive it fast." },
      ],
      testimonials: [
        { name: "Priya S.", text: "Uploaded my thesis at midnight, picked up printed copies by noon. Brilliant!", role: "Student" },
        { name: "Rahul M.", text: "The resume design landed me interviews. Worth every rupee.", role: "Job seeker" },
        { name: "Anita K.", text: "So convenient — no more standing in line at the shop.", role: "Home-maker" },
      ],
    },
    about: {
      title: "About PrintWala",
      subtitle: "We bring the everyday services you rely on online.",
      body:
        "PrintWala started as a single print shop with a simple frustration: people were wasting hours waiting in line for jobs that should take minutes. So we put the whole shop online.\n\nToday we help thousands of customers print, design and complete paperwork without leaving home. Upload what you need, pay securely, and we take it from there — with the same care and quality you'd expect from your trusted local shop.",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      values: [
        { title: "Fast turnaround", text: "Most orders ready within hours, not days." },
        { title: "Fair pricing", text: "Transparent rates with no hidden charges." },
        { title: "Real people", text: "A friendly team that treats your work like their own." },
      ],
    },
    contact: {
      title: "Get in touch",
      subtitle: "Questions about an order or a service? We're here to help.",
    },
  };

  for (const [key, value] of Object.entries(content)) {
    await prisma.content.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("  Site content seeded.");

  console.log("Seeding complete ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
