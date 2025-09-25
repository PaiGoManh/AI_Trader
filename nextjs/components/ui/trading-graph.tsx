"use client";
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export interface TradeData {
  date: string;
  trades: number;
}

interface TradingGraphProps {
  data: TradeData[];
}

const TradingGraph: React.FC<TradingGraphProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#232936" />
      <XAxis dataKey="date" stroke="#a3aed6" />
      <YAxis stroke="#a3aed6" />
      <Tooltip contentStyle={{ background: "#222", color: "#fff", border: "none" }} />
      <Line type="monotone" dataKey="trades" stroke="#48ffb8" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default TradingGraph;
