import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create a demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      name: "Demo Agency",
      slug: "demo-agency",
      brandColor: "#6366f1",
      logo: null,
    },
  })

  // Create a demo user (freelancer)
  const hashedPassword = await bcrypt.hash("password123", 12)
  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Alex Freeman",
      email: "admin@demo.com",
      password: hashedPassword,
      role: "OWNER",
      workspaceId: workspace.id,
    },
  })

  // Create a demo client
  const client = await prisma.client.upsert({
    where: { email_workspaceId: { email: "client@example.com", workspaceId: workspace.id } },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "client@example.com",
      workspaceId: workspace.id,
    },
  })

  // Create a demo project
  const project = await prisma.project.upsert({
    where: { id: "demo-project-1" },
    update: {},
    create: {
      id: "demo-project-1",
      title: "E-commerce Website Redesign",
      description: "Full redesign of the company website with new branding and improved UX.",
      status: "ACTIVE",
      dueDate: new Date("2026-05-01"),
      workspaceId: workspace.id,
      clientId: client.id,
    },
  })

  // Create timeline events
  const timelineData = [
    { title: "Project Kickoff", date: new Date("2026-03-01"), completed: true },
    { title: "Wireframes & Design", date: new Date("2026-03-15"), completed: true },
    { title: "Development Phase 1", date: new Date("2026-04-01"), completed: false },
    { title: "Client Review", date: new Date("2026-04-15"), completed: false },
    { title: "Launch", date: new Date("2026-05-01"), completed: false },
  ]

  for (const event of timelineData) {
    await prisma.timelineEvent.create({
      data: { ...event, projectId: project.id },
    })
  }

  // Create approval items
  await prisma.approvalItem.createMany({
    data: [
      {
        projectId: project.id,
        title: "Homepage Design Mockup",
        description: "Initial homepage design with new color scheme and layout.",
        status: "APPROVED",
      },
      {
        projectId: project.id,
        title: "Product Page Template",
        description: "Template design for all product listing pages.",
        status: "PENDING",
      },
      {
        projectId: project.id,
        title: "Mobile Navigation",
        description: "Mobile responsive navigation and hamburger menu design.",
        status: "REVISION",
        clientNote: "Please make the hamburger menu larger and easier to tap.",
      },
    ],
  })

  // Create a draft invoice
  await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      projectId: project.id,
      amount: 2500,
      currency: "USD",
      status: "SENT",
      dueDate: new Date("2026-04-10"),
      notes: "50% deposit for website redesign project.",
    },
  })

  console.log("✅ Seed complete!")
  console.log(`📧 Login: admin@demo.com | Password: password123`)
  console.log(`🏢 Workspace slug: demo-agency`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
