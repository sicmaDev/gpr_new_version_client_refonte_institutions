import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LabelIcon from "@mui/icons-material/Label";
import { slaReasons, slaAddReason, slaUpdateReason, slaDeleteReason } from "../../apis/Sla/SlaApi";
import {
  Panel, Empty, PrimaryButton, RowActions, SlaDialog, FieldLabel, fieldProps,
  tableContainerSx, headCellSx, bodyRowSx,
} from "./slaUi";
import { notify } from "../../Utils/alert";

// Une liste de motifs (retard, ou clôture sans mesure de satisfaction).
const ReasonList = ({ kind, title, help }) => {
  const [items, setItems] = useState(null);
  const [dialog, setDialog] = useState(null); // { id?, label }
  const [saving, setSaving] = useState(false);

  const load = () => slaReasons(kind).then(setItems).catch((e) => notify(e.message, "error"));
  useEffect(() => { load(); }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    const libelle = (dialog.label || "").trim();
    if (!libelle) { notify("Saisissez le libellé du motif", "error"); return; }
    setSaving(true);
    try {
      if (dialog.id) await slaUpdateReason(dialog.id, { libelle });
      else await slaAddReason({ libelle, kind });
      setDialog(null);
      load();
    } catch (e) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    try { await slaDeleteReason(id); load(); } catch (e) { notify(e.message, "error"); }
  };

  return (
    <Panel
      title={title} subtitle={help}
      right={<PrimaryButton startIcon={<AddIcon />} onClick={() => setDialog({ label: "" })}>Ajouter</PrimaryButton>}
    >
      {!items ? <Empty>Chargement...</Empty> : items.length === 0 ? <Empty>Aucun motif</Empty> : (
        <TableContainer sx={tableContainerSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx()}>Motif</TableCell>
                <TableCell sx={{ ...headCellSx(110), width: 110 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id} sx={bodyRowSx}>
                  <TableCell>{r.libelle}</TableCell>
                  <TableCell>
                    <RowActions
                      onEdit={() => setDialog({ id: r.id, label: r.libelle })}
                      onDelete={() => remove(r.id)}
                      deleteTitle="Désactiver (le motif reste lié aux anciennes plaintes)"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SlaDialog
        open={!!dialog} onClose={() => setDialog(null)} icon={LabelIcon} loading={saving} onSubmit={save}
        title={dialog?.id ? "Modifier le motif" : "Nouveau motif"} subtitle={title}
      >
        {dialog && (
          <>
            <FieldLabel required>Libellé</FieldLabel>
            <TextField
              {...fieldProps} autoFocus value={dialog.label} placeholder="Ex. Dossier en attente d'une pièce"
              onChange={(e) => setDialog({ ...dialog, label: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </>
        )}
      </SlaDialog>
    </Panel>
  );
};

// Motifs configurables (administrateur).
const SlaMotifsTab = () => (
  <div>
    <ReasonList kind="RETARD" title="Motifs de retard"
      help="Proposés à l'agent, au chef d'agence ou au Pilote pour justifier le retard d'une plainte." />
    <ReasonList kind="NON_MESURE" title="Motifs de clôture sans mesure"
      help="Proposés au Pilote pour clôturer une réclamation traitée dont la satisfaction n'a pas pu être mesurée." />
  </div>
);

export default SlaMotifsTab;
