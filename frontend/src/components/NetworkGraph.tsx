"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { Card } from "@/components/ui";
import { slideUpVariants } from "@/lib/animations";
import type { GraphLink, GraphNode } from "@/types/analysis";
import { DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_LINKS } from "@/lib/graph-fallback";

interface NetworkGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
}

type SimNode = d3.SimulationNodeDatum & GraphNode;
type SimLink = d3.SimulationLinkDatum<SimNode> & GraphLink;

// Updated color palette: primary #2563EB, green #10B981, yellow #F59E0B, red #EF4444
const clusterColors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];

function linkColor(kind: GraphLink["kind"]) {
  if (kind === "semantic") return "#3B82F6";
  if (kind === "temporal") return "#F59E0B";
  return "#EF4444";
}

export function NetworkGraph({ nodes, links }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Determine if we're using fallback data (both nodes and links should match)
    const nodesAreEmpty = !nodes || nodes.length === 0;
    const linksAreEmpty = !links || links.length === 0;
    
    // Use fallback for BOTH if nodes are empty, otherwise use the provided ones
    const displayNodes = nodesAreEmpty ? DEFAULT_GRAPH_NODES : nodes;
    const displayLinks = nodesAreEmpty ? DEFAULT_GRAPH_LINKS : (linksAreEmpty ? [] : links);

    // Create simulation nodes and links with proper ID mapping
    const simNodes: SimNode[] = displayNodes.map((n) => ({ ...n }));
    
    // Map and filter links, only keeping those with valid source and target nodes
    const simLinkData = displayLinks.map((l) => {
      const sourceNode = simNodes.find(n => n.id === l.source);
      const targetNode = simNodes.find(n => n.id === l.target);
      
      if (sourceNode && targetNode) {
        return {
          ...l,
          source: sourceNode,
          target: targetNode,
        };
      }
      return null;
    });
    
    const simLinks: SimLink[] = simLinkData.filter((l) => l !== null) as SimLink[];

    const width = containerRef.current.clientWidth;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .distance(90)
          .strength(0.35)
      )
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<SimNode>().radius((d: SimNode) => 10 + Math.sqrt(d.followers) / 9)
      );

    const linkSel = svg
      .append("g")
      .attr("stroke-width", 1.6)
      .selectAll<SVGLineElement, SimLink>("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", (d: SimLink) => linkColor(d.kind))
      .attr("stroke-opacity", 0.8);

    const nodeSel = svg
      .append("g")
      .selectAll<SVGCircleElement, SimNode>("circle")
      .data(simNodes)
      .join("circle")
      .attr("r", (d: SimNode) => 8 + Math.sqrt(d.followers) / 18)
      .attr("fill", (d: SimNode) => clusterColors[d.cluster % clusterColors.length])
      .attr("stroke", "#051428")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (_event: MouseEvent, d: SimNode) => setSelected(d))
      .call(
        d3
          .drag<SVGCircleElement, SimNode>()
          .on("start", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const labelSel = svg
      .append("g")
      .selectAll<SVGTextElement, SimNode>("text")
      .data(simNodes)
      .join("text")
      .text((d: SimNode) => d.label)
      .attr("font-size", 10)
      .attr("fill", "#A3D3E8")
      .attr("dx", 10)
      .attr("dy", 4)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d: SimLink) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d: SimLink) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d: SimLink) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d: SimLink) => (d.target as SimNode).y ?? 0);

      nodeSel.attr("cx", (d: SimNode) => d.x ?? 0).attr("cy", (d: SimNode) => d.y ?? 0);
      labelSel.attr("x", (d: SimNode) => d.x ?? 0).attr("y", (d: SimNode) => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <Card
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      aria-label="Account coordination network showing relationships between accounts"
      role="region"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider">Coordination Network</p>
        <p className="text-caption text-text-secondary">Drag nodes • Click for details</p>
      </div>

      <div ref={containerRef} className="h-96 rounded-lg border border-border-default bg-surface-2 relative group">
        <svg ref={svgRef} className="h-full w-full" />
        
        {/* Legend Panel */}
        <motion.div 
          className="absolute top-4 left-4 rounded-lg border border-border-default bg-surface-2 backdrop-blur-xl p-3 z-10 shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-caption font-semibold text-text-secondary mb-2">Network Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary-600" />
              <span className="text-caption text-text-secondary">Account Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 bg-primary-500" />
              <span className="text-caption text-text-secondary">Semantic Link</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 bg-warning" />
              <span className="text-caption text-text-secondary">Temporal Link</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-4 bg-error" />
              <span className="text-caption text-text-secondary">URL Link</span>
            </div>
          </div>
        </motion.div>
      </div>

      {selected ? (
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-surface-2 rounded-lg border border-border-default"
        >
          <p className="font-semibold text-text-primary">{selected.label}</p>
          <p className="mt-1 text-caption text-text-secondary">Followers: {selected.followers.toLocaleString()}</p>
          <p className="mt-1 text-caption text-text-secondary">Cluster: {selected.cluster}</p>
        </motion.aside>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-caption text-text-secondary"
        >
          Click on any node to view account details
        </motion.div>
      )}
    </Card>
  );
}
