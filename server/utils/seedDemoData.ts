import { CategoryModel } from "../app/models/category";
import { ProjectModel } from "../app/models/project";
import { ProposalModel } from "../app/models/proposal";
import { UserModel } from "../app/models/user";
import { DEMO_USERS } from "./constants";
import { seedDemoUsers } from "./seedDemoUsers";

const CATEGORIES = [
  { title: "برنامه نویسی", englishTitle: "development", description: "web and mobile development" },
  { title: "طراحی", englishTitle: "design", description: "ui, ux and graphic design" },
  { title: "ترجمه", englishTitle: "translation", description: "translation and content" },
];

const DAY = 24 * 60 * 60 * 1000;

// Base fields are Persian; translations.en holds the English (PRD F10).
const PROJECTS = [
  {
    category: "development",
    title: "طراحی وب‌سایت فروشگاهی",
    description: "یک فروشگاه اینترنتی با سبد خرید و پرداخت آزمایشی نیاز داریم.",
    tags: ["ری‌اکت", "نود"],
    budget: 50000000,
    en: {
      title: "Online store website",
      description: "We need an online store with a cart and a test checkout.",
      tags: ["React", "Node"],
    },
    proposal: {
      description: "فروشگاه را با ری‌اکت و اکسپرس در سه هفته می‌سازم.",
      en: "I will build the store with React and Express in three weeks.",
      price: 45000000,
      duration: 21,
    },
  },
  {
    category: "design",
    title: "طراحی لوگوی استارتاپ",
    description: "لوگو و راهنمای رنگ برای یک استارتاپ آموزشی می‌خواهیم.",
    tags: ["لوگو", "برندینگ"],
    budget: 8000000,
    en: {
      title: "Startup logo design",
      description: "We want a logo and a color guide for an education startup.",
      tags: ["Logo", "Branding"],
    },
    proposal: {
      description: "سه طرح اولیه و دو بار اصلاح در یک هفته تحویل می‌دهم.",
      en: "I deliver three drafts and two rounds of changes in a week.",
      price: 7000000,
      duration: 7,
    },
  },
  {
    category: "translation",
    title: "ترجمه مستندات فنی",
    description: "مستندات API ما باید از انگلیسی به فارسی ترجمه شود.",
    tags: ["ترجمه", "مستندات"],
    budget: 5000000,
    en: {
      title: "Technical docs translation",
      description: "Our API documentation needs translating from English to Persian.",
      tags: ["Translation", "Docs"],
    },
    proposal: {
      description: "مستندات را با واژه‌نامه یکدست در ده روز ترجمه می‌کنم.",
      en: "I will translate the docs with a consistent glossary in ten days.",
      price: 4500000,
      duration: 10,
    },
  },
];

// Every write is an upsert on a natural key, so running it again changes nothing.
export async function seedDemoData() {
  await seedDemoUsers();
  const owner = await UserModel.findOne({ username: DEMO_USERS.OWNER.username });
  const freelancer = await UserModel.findOne({ username: DEMO_USERS.FREELANCER.username });
  if (!owner || !freelancer) throw new Error("demo users were not seeded");

  for (const category of CATEGORIES)
    await CategoryModel.updateOne(
      { englishTitle: category.englishTitle },
      { $set: { ...category, type: "project" } },
      { upsert: true }
    );

  for (const { category, en, proposal, ...fields } of PROJECTS) {
    const { _id: categoryId } = (await CategoryModel.findOne({ englishTitle: category }))!;
    await ProjectModel.updateOne(
      { owner: owner._id, title: fields.title },
      {
        $set: { ...fields, category: categoryId, translations: { en } },
        // a fixed deadline would expire; only set it on the first run
        $setOnInsert: { deadline: new Date(Date.now() + 30 * DAY) },
      },
      { upsert: true }
    );
    const project = (await ProjectModel.findOne({ owner: owner._id, title: fields.title }))!;

    await ProposalModel.updateOne(
      { user: freelancer._id, project: project._id },
      {
        $set: {
          description: proposal.description,
          translations: { en: { description: proposal.en } },
          price: proposal.price,
          duration: proposal.duration,
        },
      },
      { upsert: true }
    );
    const { _id: proposalId } = (await ProposalModel.findOne({ user: freelancer._id, project: project._id }))!;
    await ProjectModel.updateOne({ _id: project._id }, { $addToSet: { proposals: proposalId } });
  }
}
