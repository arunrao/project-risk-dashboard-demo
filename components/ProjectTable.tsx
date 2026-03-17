'use client';

import React, { useState, useMemo } from 'react';
import { 
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, 
  ProgressBar, TextInput, MultiSelect, MultiSelectItem, Select, SelectItem
} from '@tremor/react';
import { ChevronRight, ChevronDown, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { AnalyzedProjectRow, RiskResult } from '@/types';
import { RiskBadge } from './RiskBadge';

interface ProjectTableProps {
  projects: AnalyzedProjectRow[];
}

type SortField = 'name' | 'pctComplete' | 'schedule_risk_score' | 'cost_risk_score' | 'composite_risk_score' | 'risk_label';
type SortOrder = 'asc' | 'desc';

export function ProjectTable({ projects }: ProjectTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('composite_risk_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to desc for scores
    }
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const filteredAndSorted = useMemo(() => {
    return projects
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (p.owner && p.owner.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRisk = riskFilters.length === 0 || 
                            (p.riskData && riskFilters.includes(p.riskData.risk_label));
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof AnalyzedProjectRow];
        let valB: any = b[sortField as keyof AnalyzedProjectRow];

        if (sortField.endsWith('score') || sortField === 'risk_label') {
          valA = a.riskData ? a.riskData[sortField as keyof RiskResult] : 0;
          valB = b.riskData ? b.riskData[sortField as keyof RiskResult] : 0;
        }

        if (valA === valB) return 0;
        const compare = valA > valB ? 1 : -1;
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [projects, searchTerm, riskFilters, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-transparent inline-block w-4 h-4 ml-1">↓</span>;
    return sortOrder === 'asc' 
      ? <ArrowUp className="inline-block w-3 h-3 ml-1 text-white" />
      : <ArrowDown className="inline-block w-3 h-3 ml-1 text-white" />;
  };

  const getProgressColor = (score?: number) => {
    if (!score) return "slate";
    if (score >= 75) return "red";
    if (score >= 50) return "orange";
    if (score >= 25) return "amber";
    return "green";
  };

  return (
    <div className="bg-[#1A1D27] border border-white/8 rounded-2xl overflow-hidden hover:border-white/16 transition-all duration-200">
      
      {/* Table Controls */}
      <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1A1D27]">
        <div className="w-full sm:w-72">
          <TextInput
            icon={Search}
            placeholder="Search projects or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0F1117] border-white/8 text-white focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-64">
          <MultiSelect
            placeholder="Filter by Risk..."
            value={riskFilters}
            onValueChange={setRiskFilters}
            className="bg-[#0F1117] border-white/8 text-white"
          >
            <MultiSelectItem value="Critical">Critical</MultiSelectItem>
            <MultiSelectItem value="High">High</MultiSelectItem>
            <MultiSelectItem value="Medium">Medium</MultiSelectItem>
            <MultiSelectItem value="Low">Low</MultiSelectItem>
          </MultiSelect>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="w-full text-left table-fixed min-w-[1000px]">
          <TableHead className="bg-[#1A1D27] border-b border-white/8">
            <TableRow>
              <TableHeaderCell className="w-8 shrink-0 py-3 px-4"></TableHeaderCell>
              <TableHeaderCell 
                className="w-[20%] font-semibold text-white cursor-pointer hover:bg-white/4 py-3 px-4"
                onClick={() => handleSort('name')}
              >
                Project <SortIcon field="name" />
              </TableHeaderCell>
              <TableHeaderCell className="w-[10%] font-semibold text-white py-3 px-4">Owner</TableHeaderCell>
              <TableHeaderCell className="w-[10%] font-semibold text-white py-3 px-4 font-mono text-xs">End Date</TableHeaderCell>
              <TableHeaderCell 
                className="w-[10%] font-semibold text-white cursor-pointer hover:bg-white/4 py-3 px-4"
                onClick={() => handleSort('pctComplete')}
              >
                % Complete <SortIcon field="pctComplete" />
              </TableHeaderCell>
              <TableHeaderCell className="w-[8%] font-semibold text-white py-3 px-4 text-center">Schedule</TableHeaderCell>
              <TableHeaderCell className="w-[8%] font-semibold text-white py-3 px-4 text-center">Cost</TableHeaderCell>
              <TableHeaderCell 
                className="w-[8%] font-semibold text-white cursor-pointer hover:bg-white/4 py-3 px-4 text-center"
                onClick={() => handleSort('composite_risk_score')}
              >
                Score <SortIcon field="composite_risk_score" />
              </TableHeaderCell>
              <TableHeaderCell 
                className="w-[12%] font-semibold text-white cursor-pointer hover:bg-white/4 py-3 px-4"
                onClick={() => handleSort('risk_label')}
              >
                Risk Level <SortIcon field="risk_label" />
              </TableHeaderCell>
              <TableHeaderCell className="w-[20%] font-semibold text-white py-3 px-4">Risk Summary</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-white/8">
            {filteredAndSorted.map((p, i) => {
              const isExpanded = expandedRows.has(i);
              const isPastDue = p.endDate && new Date(p.endDate) < new Date() && (p.pctComplete || 0) < 100;
              const hasData = !!p.riskData;
              
              return (
                <React.Fragment key={i}>
                  <TableRow 
                    className="hover:bg-white/4 transition-colors duration-150 cursor-pointer"
                    onClick={() => hasData && toggleRow(i)}
                  >
                    <TableCell className="w-8 py-3 px-4">
                      {hasData ? (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted border-t-white animate-spin" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-white truncate py-3 px-4" title={p.name}>{p.name}</TableCell>
                    <TableCell className="text-muted text-sm truncate py-3 px-4" title={p.owner}>{p.owner || '--'}</TableCell>
                    <TableCell className={`font-mono text-xs py-3 px-4 ${isPastDue ? 'text-red-400' : 'text-muted'}`}>
                      {p.endDate || '--'}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="w-full flex items-center space-x-2">
                        <span className="text-xs text-muted w-8 font-mono">{p.pctComplete !== undefined ? `${p.pctComplete}%` : '--'}</span>
                        <ProgressBar value={p.pctComplete || 0} color={getProgressColor(p.riskData?.composite_risk_score)} className="mt-0" />
                      </div>
                    </TableCell>
                    
                    {hasData ? (
                      <>
                        <TableCell className="text-center font-mono text-sm py-3 px-4 text-white/80">{p.riskData!.schedule_risk_score}</TableCell>
                        <TableCell className="text-center font-mono text-sm py-3 px-4 text-white/80">{p.riskData!.cost_risk_score}</TableCell>
                        <TableCell className="text-center py-3 px-4">
                          <span className="font-mono text-lg font-bold" style={{ color: `var(--risk-${p.riskData!.risk_label.toLowerCase()})`}}>
                            {p.riskData!.composite_risk_score}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <RiskBadge label={p.riskData!.risk_label} />
                        </TableCell>
                        <TableCell className="text-xs text-muted truncate max-w-[200px] py-3 px-4" title={p.riskData!.risk_summary}>
                          {p.riskData!.risk_summary}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell colSpan={5} className="text-center text-muted text-xs font-mono py-3 px-4 italic">Analyzing...</TableCell>
                    )}
                  </TableRow>

                  {/* Expansion Drawer */}
                  {isExpanded && hasData && (
                    <TableRow className="bg-[#0F1117] border-b border-white/8">
                      <TableCell colSpan={10} className="p-0">
                        <div className="p-6 overflow-hidden">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recommended Action</h4>
                                <p className="text-white text-sm leading-relaxed border-l-2 border-blue-500 pl-3">
                                  {p.riskData!.recommended_action}
                                </p>
                              </div>
                              <button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-md font-medium text-xs transition-colors">
                                Flag for Escalation
                              </button>
                            </div>
                            
                            <div className="flex-1 bg-[#1A1D27] p-4 rounded-xl border border-white/5 overflow-x-auto">
                              <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">Raw Ingestion Data</h4>
                              <pre className="text-[10px] font-mono text-white/60 leading-tight">
                                {JSON.stringify(p.rawRowData || {}, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredAndSorted.length === 0 && projects.length > 0 && (
        <div className="text-center py-12 text-muted">
          No projects match the current filters.
        </div>
      )}
    </div>
  );
}
