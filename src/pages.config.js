import { lazy } from "react";
import __Layout from "./Layout.jsx";

const About = lazy(() => import("./pages/About.jsx"));
const Office = lazy(() => import("./pages/Office.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const BrandKit = lazy(() => import("./pages/BrandKit.jsx"));
const Call = lazy(() => import("./pages/Call.jsx"));
const CaseStudy = lazy(() => import("./pages/CaseStudy.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Portfolio = lazy(() => import("./pages/Portfolio.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse.jsx"));

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
