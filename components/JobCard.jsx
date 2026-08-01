"use client";

import StampLine from "./StampLine";
import Sakura from "./Sakura";
import CompanyAvatar from "./CompanyAvatar";
import { IconBookmark } from "./Icon";
import { matchBand } from "@/lib/match";

export default function JobCard({ job, index, saved, onOpen, onSave }) {
  const band = job.match ? matchBand(job.match.score) : null;
  const top = job.salary.max ?? job.salary.min;

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
      onClick={() => onOpen(job)}
    >
      <Sakura variant={index % 2 === 0 ? "kartu" : "kartu-alt"} />

      <button
        type="button"
        className="save"
        aria-pressed={saved}
        aria-label={saved ? `Hapus ${job.title} dari simpanan` : `Simpan ${job.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onSave(job.id);
        }}
      >
        <IconBookmark filled={saved} />
      </button>

      <div className="card-top">
        <CompanyAvatar name={job.company} size="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="card-title" style={{ paddingRight: job.match ? 0 : 34 }}>
            <button
              type="button"
              className="card-open"
              aria-haspopup="dialog"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(job);
              }}
            >
              {job.title}
            </button>
          </h3>
          <div className="card-co">
            <span>{job.company}</span>
            <span className="dot" aria-hidden="true" />
            <span>{job.city}</span>
            <span className="dot" aria-hidden="true" />
            <span>{job.seniority}</span>
          </div>
        </div>

        {job.match && (
          <div
            className="ring"
            data-tone={band.tone}
            style={{ marginRight: 34 }}
            title={`${band.label}, skor ${job.match.score} dari 100`}
          >
            {job.match.score}
          </div>
        )}
      </div>

      <StampLine gates={job.gates} />

      {job.stack.length > 0 && (
        <div className="tagrow">
          {job.stack.slice(0, 5).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
          {job.stack.length > 5 && <span className="tag">+{job.stack.length - 5}</span>}
        </div>
      )}

      <div className="card-money">
        {top ? (
          <>
            <span className="money-yen">{job.salary.text}</span>
            <span className="money-idr">≈ {job.salaryIdrMonthly}</span>
          </>
        ) : (
          <span className="money-none">Gaji tidak dicantumkan</span>
        )}
      </div>
    </article>
  );
}
