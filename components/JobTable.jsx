"use client";

import CompanyAvatar from "./CompanyAvatar";
import StampLine from "./StampLine";
import { JP_SHORT, REMOTE_LABEL } from "@/lib/normalize";
import { IconBookmark } from "./Icon";
import { matchBand } from "@/lib/match";


/**
 * Tampilan tabel. Dipakai saat orang mau bandingkan banyak lowongan
 * sekaligus (gaji, syarat, kota) dalam satu pandangan, tanpa buka satu-satu
 * seperti di tampilan kartu.
 */
export default function JobTable({ jobs, saved, onOpen, onSave }) {
  return (
    <div className="table-wrap">
      <table className="job-table">
        <thead>
          <tr>
            <th scope="col">Perusahaan</th>
            <th scope="col">Posisi</th>
            <th scope="col">Syarat</th>
            <th scope="col">Bahasa</th>
            <th scope="col">Gaji</th>
            <th scope="col">Kota</th>
            {jobs[0]?.match && <th scope="col">Cocok</th>}
            <th scope="col" aria-label="Simpan" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const isSaved = saved.includes(job.id);
            const band = job.match ? matchBand(job.match.score) : null;
            return (
              <tr key={job.id} onClick={() => onOpen(job)} tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" ? onOpen(job) : null)}>
                <td>
                  <div className="table-co">
                    <CompanyAvatar name={job.company} size="sm" />
                    <span>{job.company}</span>
                  </div>
                </td>
                <td>
                  <span className="table-title">{job.title}</span>
                  <span className="table-sub">{job.seniority} · {job.category}</span>
                </td>
                <td>
                  <StampLine gates={job.gates} size="sm" />
                </td>
                <td className="mono table-jp">{JP_SHORT[job.japanese]}</td>
                <td className="mono">{job.salary.text || "—"}</td>
                <td>{job.city} · {REMOTE_LABEL[job.remote]}</td>
                {job.match && (
                  <td>
                    <span className="table-score" data-tone={band.tone}>{job.match.score}</span>
                  </td>
                )}
                <td>
                  <button
                    type="button"
                    className="mini-save"
                    aria-pressed={isSaved}
                    aria-label={isSaved ? "Hapus dari simpanan" : "Simpan"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(job.id);
                    }}
                  >
                    <IconBookmark filled={isSaved} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
