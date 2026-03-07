import React from "react";
import { motion } from "framer-motion";
import {
  LogoHorizontal,
  LogoStacked,
  LogoBadge,
  NMIcon,
  LogoFooter,
} from "@/components/brand/Logo";

function Swatch({ hex, name, role }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        style={{ backgroundColor: hex }}
      />
      <p className="font-semibold text-[#1A2332] dark:text-white text-sm">
        {name}
      </p>
      <p className="text-xs text-gray-500 font-mono">{hex}</p>
      <p className="text-xs text-gray-400">{role}</p>
    </div>
  );
}

function Card({ label, bg = "bg-white dark:bg-[#1E2830]", children }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${bg}`}
    >
      <div className="p-6">{children}</div>
      <div className="px-6 py-3 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 font-mono">{label}</p>
      </div>
    </div>
  );
}

export default function BrandKit() {
  return (
    <main className="pt-20 min-h-screen bg-[#F7F7F7] dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-3">
            Brand Assets
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-4">
            NEEDMO CONSULT — Brand Kit
          </h1>
          <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl">
            Official logo variations, color palette, typography, and usage
            guidelines for the NEEDMO CONSULT brand.
          </p>
        </motion.div>

        {/* ── SECTION 1: Logo Variations ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Logo Variations
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Use the horizontal version in the header. The stacked version works
            for square placements.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Horizontal — Light */}
            <Card label="Horizontal · Light Mode">
              <div className="flex items-center justify-center py-8 bg-white rounded-xl">
                <LogoHorizontal forceLight size="md" />
              </div>
            </Card>

            {/* Horizontal — Dark */}
            <Card label="Horizontal · Dark Mode" bg="bg-[#1A2332]">
              <div className="flex items-center justify-center py-8 bg-[#0F1419] rounded-xl">
                <LogoHorizontal forceDark size="md" />
              </div>
            </Card>

            {/* Horizontal — Large */}
            <Card label="Horizontal · Large (hero/display)">
              <div className="flex items-center justify-center py-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1E2830] dark:to-[#0F1419]">
                <LogoHorizontal size="lg" />
              </div>
            </Card>

            {/* Stacked — Light */}
            <Card label="Stacked · Light Mode">
              <div className="flex items-center justify-center py-10 bg-white rounded-xl">
                <LogoStacked forceLight size="md" />
              </div>
            </Card>

            {/* Stacked — Dark */}
            <Card label="Stacked · Dark Mode" bg="bg-[#1A2332]">
              <div className="flex items-center justify-center py-10 bg-[#0F1419] rounded-xl">
                <LogoStacked forceDark size="md" />
              </div>
            </Card>

            {/* Stacked — Large */}
            <Card label="Stacked · Large">
              <div className="flex items-center justify-center py-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1E2830] dark:to-[#0F1419]">
                <LogoStacked size="lg" />
              </div>
            </Card>

            {/* Footer version */}
            <Card label="Footer Logo (always white)" bg="bg-[#1A2332]">
              <div className="flex items-center justify-center py-8 bg-[#1A2332] rounded-xl">
                <LogoFooter />
              </div>
            </Card>

            {/* Social Badge */}
            <Card label="Social Media Badge (400×400 concept)">
              <div className="flex items-center justify-center py-6 rounded-xl bg-gray-100 dark:bg-[#0F1419]">
                <LogoBadge size={140} />
              </div>
            </Card>

            {/* Icon only — various sizes */}
            <Card label="NM Monogram Icon — Sizes">
              <div className="flex items-end justify-center gap-5 py-6">
                <div className="flex flex-col items-center gap-2">
                  <NMIcon size={16} />
                  <span className="text-xs text-gray-400">16px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <NMIcon size={24} />
                  <span className="text-xs text-gray-400">24px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <NMIcon size={32} />
                  <span className="text-xs text-gray-400">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <NMIcon size={48} />
                  <span className="text-xs text-gray-400">48px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <NMIcon size={64} />
                  <span className="text-xs text-gray-400">64px</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── SECTION 2: Logo on Backgrounds ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Logo on Various Backgrounds
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Approved background pairings to maintain legibility and brand
            consistency.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { bg: "#FFFFFF", label: "White", dark: false },
              { bg: "#F7F7F7", label: "Warm White", dark: false },
              { bg: "#1A2332", label: "Navy (Primary)", dark: true },
              { bg: "#0F1419", label: "Dark Navy", dark: true },
              { bg: "#D4AF7A", label: "Orange Accent", dark: true },
              { bg: "#333333", label: "Dark Gray", dark: true },
              {
                bg: "linear-gradient(135deg, #1A2332, #D4AF7A)",
                label: "Brand Gradient",
                dark: true,
              },
              {
                bg: "linear-gradient(135deg, #F7F7F7, #FFFFFF)",
                label: "Subtle Gradient",
                dark: false,
              },
            ].map(({ bg, label, dark }) => (
              <div
                key={label}
                className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div
                  className="flex items-center justify-center py-8 px-4"
                  style={{ background: bg }}
                >
                  {dark ? (
                    <LogoHorizontal forceDark size="sm" />
                  ) : (
                    <LogoHorizontal forceLight size="sm" />
                  )}
                </div>
                <div className="px-4 py-2.5 bg-white dark:bg-[#1E2830]">
                  <p className="text-xs text-gray-500 font-mono">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: Color Palette ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Color Palette
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Brand colors and their intended use cases.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <Swatch hex="#1A2332" name="Deep Navy" role="Primary / Headers" />
            <Swatch
              hex="#D4AF7A"
              name="Electric Orange"
              role="CTAs / Accents"
            />
            <Swatch hex="#F7F7F7" name="Warm White" role="Backgrounds" />
            <Swatch hex="#333333" name="Dark Gray" role="Body Text" />
            <Swatch hex="#0F1419" name="Dark Mode BG" role="Dark Backgrounds" />
            <Swatch hex="#C49A5E" name="Orange Hover" role="Hover State" />
          </div>
        </section>

        {/* ── SECTION 4: Typography ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Typography Scale
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Font family: Figtree for headings and body (minimalist sans-serif)
          </p>

          <div className="bg-white dark:bg-[#1E2830] rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-6">
            {[
              {
                label: "H1 Display",
                size: "text-5xl",
                weight: "font-black",
                text: "Your Brand Deserves More.",
              },
              {
                label: "H2 Section",
                size: "text-4xl",
                weight: "font-bold",
                text: "Our Services",
              },
              {
                label: "H3 Card",
                size: "text-2xl",
                weight: "font-bold",
                text: "Content Creation",
              },
              {
                label: "H4 Sub",
                size: "text-xl",
                weight: "font-semibold",
                text: "Strategy-Led Approach",
              },
              {
                label: "Body Large",
                size: "text-lg",
                weight: "font-normal",
                text: "We help businesses grow their social presence with content that converts.",
              },
              {
                label: "Body Base",
                size: "text-base",
                weight: "font-normal",
                text: "Results-driven strategy tailored to your goals, audience, and platform.",
              },
              {
                label: "Caption",
                size: "text-sm",
                weight: "font-normal",
                text: "WHAT WE DO  ·  TRANSPARENT PRICING  ·  CLIENT SUCCESS",
              },
              {
                label: "Accent Label",
                size: "text-xs",
                weight: "font-semibold",
                text: "UPPERCASE TRACKING LABEL",
                accent: true,
              },
            ].map(({ label, size, weight, text, accent }) => (
              <div
                key={label}
                className="flex items-baseline gap-6 border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
              >
                <span className="w-28 text-xs text-gray-400 font-mono flex-shrink-0">
                  {label}
                </span>
                <span
                  className={`${size} ${weight} ${
                    accent
                      ? "tracking-widest text-[#D4AF7A]"
                      : "text-[#1A2332] dark:text-white"
                  } leading-tight`}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 5: Logo Usage Rules ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Logo Usage Rules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Keep the logo clear and consistent across all touchpoints.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Do */}
            <div className="bg-white dark:bg-[#1E2830] rounded-2xl border border-green-200 dark:border-green-900 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <h3 className="font-bold text-[#1A2332] dark:text-white">Do</h3>
              </div>
              <ul className="space-y-3 text-sm text-[#333333] dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Use the approved light or dark version based on background
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Maintain minimum clear space equal to the icon width on all
                  sides
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Use the footer (white) version on dark backgrounds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Scale proportionally — never stretch or squish
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Use the badge version for social media profile photos
                </li>
              </ul>
            </div>

            {/* Don't */}
            <div className="bg-white dark:bg-[#1E2830] rounded-2xl border border-red-200 dark:border-red-900 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✕</span>
                </div>
                <h3 className="font-bold text-[#1A2332] dark:text-white">
                  Don't
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-[#333333] dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  Change the font or letter spacing of NEEDMO or CONSULT
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  Use the light version on dark or busy backgrounds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  Rotate, flip, or add effects (shadows, outlines) to the logo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  Change the orange (#D4AF7A) accent icon to any other color
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  Use the monogram icon alone without the wordmark in marketing
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Favicon Spec ── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            Favicon &amp; App Icon
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            The NM monogram icon is used for browser favicons and app icons.
          </p>
          <div className="flex flex-wrap gap-8 items-end">
            {[16, 32, 48, 64, 96, 128].map((size) => (
              <div key={size} className="flex flex-col items-center gap-3">
                <div className="bg-white dark:bg-[#1E2830] rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
                  <NMIcon size={size} />
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {size}×{size}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
