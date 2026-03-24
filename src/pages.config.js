import { lazy } from "react";
import __Layout from "./Layout.jsx";

const About = lazy(() => import("./pages/About"));
const Office = lazy(() => import("./pages/Office"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BrandKit = lazy(() => import("./pages/BrandKit"));
const Call = lazy(() => import("./pages/Call"));
const CaseStudy = lazy(() => import("./pages/CaseStudy"));
const Contact = lazy(() => import("./pages/Contact"));
const Home = lazy(() => import("./pages/Home"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Services = lazy(() => import("./pages/Services"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));

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