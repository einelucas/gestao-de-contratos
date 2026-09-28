"use client";

import { MAX_REPORTED_ISSUES, type RecordIssue } from "@/features/contract-data/contract-import.types";

export function ImportIssuesList({ issues }: { issues: RecordIssue[] }) {
  if (!issues.length) return null;
  const visible = issues.slice(0, MAX_REPORTED_ISSUES);
  return (
    <div className="import-issues">
      <strong className="import-issues-title">
        Não foi possível importar {issues.length} {issues.length === 1 ? "registro" : "registros"}.
      </strong>
      <ul className="import-issue-list">
        {visible.map((issue) => (
          <li key={issue.index}>
            <span>{issue.label}</span>
            <ul>{issue.messages.map((message) => <li key={message}>{message}</li>)}</ul>
          </li>
        ))}
      </ul>
      {issues.length > visible.length && (
        <p className="import-issues-more">… e mais {issues.length - visible.length} registro(s) com problema.</p>
      )}
    </div>
  );
}
