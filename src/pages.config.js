import { lazyWithRetry } from "./utils/lazyWithRetry.js";
import __Layout from "./Layout.jsx";

const About = lazyWithRetry(() => import("./pages/About.jsx"));
const Office = lazyWithRetry(() => import("./pages/Office.jsx"));
const Blog = lazyWithRetry(() => import("./pages/Blog.jsx"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost.jsx"));
const BrandKit = lazyWithRetry(() => import("./pages/BrandKit.jsx"));
const Call = lazyWithRetry(() => import("./pages/Call.jsx"));
const CaseStudy = lazyWithRetry(() => import("./pages/CaseStudy.jsx"));
const Contact = lazyWithRetry(() => import("./pages/Contact.jsx"));
const Home = lazyWithRetry(() => import("./pages/Home.jsx"));
const Portfolio = lazyWithRetry(() => import("./pages/Portfolio.jsx"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing.jsx"));
const Services = lazyWithRetry(() => import("./pages/Services.jsx"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfUse = lazyWithRetry(() => import("./pages/TermsOfUse.jsx"));

export const PAGES = {
  About,
  Office,
  Blog,
  BlogPost,
  BrandKit,
  Call,
  CaseStudy,
  Contact,
  Home,
  Portfolio,
  Pricing,
  Services,
  PrivacyPolicy,
  TermsOfUse,
};

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: __Layout,
};