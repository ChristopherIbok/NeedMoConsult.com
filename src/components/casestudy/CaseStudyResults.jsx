import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export default function CaseStudyResults({ study }) {
  return (
    <section className="py-16 bg-white dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-3">
            Results That Speak for Themselves
          </h2>
          <p className="text-[#555] dark:text-gray-400">
            Data-driven proof of what strategic social media management achieves
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Follower Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F7F7F7] dark:bg-[#1A2332] rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-6">
              📈 Follower Growth Over Time
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={study.followerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1A2332",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(v) => [v.toLocaleString(), "Followers"]}
                />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#D4AF7A"
                  strokeWidth={3}
                  dot={{ fill: "#D4AF7A", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Engagement Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#F7F7F7] dark:bg-[#1A2332] rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-6">
              ⚡ Engagement Rate: Before vs. After
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={study.engagementData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 13, fill: "#94a3b8" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "#1A2332",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(v) => [`${v}%`, "Engagement"]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {study.engagementData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-around text-sm">
              {study.engagementData.map((d, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: d.color }}
                  >
                    {d.value}%
                  </div>
                  <div className="text-gray-400 text-xs">{d.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-6 text-center">
            🏆 Top Performing Posts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {study.topPosts.map((post) => (
              <div
                key={post.rank}
                className="bg-[#F7F7F7] dark:bg-[#1A2332] rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute top-3 left-3 w-8 h-8 bg-[#D4AF7A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      #{post.rank}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#1A2332] dark:text-white text-sm mb-3">
                    {post.caption}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "👁 Views", val: post.views },
                      { label: "❤️ Likes", val: post.likes },
                      { label: "💬 Comments", val: post.comments },
                      { label: "🔖 Saves", val: post.saves },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-sm font-bold text-[#1A2332] dark:text-white">
                          {s.val}
                        </div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
