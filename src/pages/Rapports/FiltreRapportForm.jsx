import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { loadItemFromSessionStorage, selectableYears } from "../../Utils/utils";

const styles = {
  control: (base) => ({ ...base, height: 35, minHeight: 35 }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const optionsPlainteType = [
  { label: "Réclamations", value: "claim" },
  { label: "Dénonciations", value: "denunciation" },
  { label: "Suggestions", value: "suggestion" },
];

// Formulaire de filtre du Rapport Global, factorisé pour être utilisé à la
// fois dans le panneau "Filtrer" de Global.js et dans le formulaire de
// création/édition de template (ReportTemplate.jsx) — même comportement,
// une seule implémentation.
//
// value : { year, plainteType, objet, etatState, product, recoredBy, unit, startDate, endDate }
// onChange(nextValue) : appelé avec la valeur complète à chaque modification
const FiltreRapportForm = ({ value, onChange }) => {
  const [showMore, setShowMore] = useState(false);
  const [optionsState, setOptionsState] = useState([
    { label: "A traiter", value: "SAVED" },
    { label: "Affectée", value: "AFFECTED" },
    { label: "Désapprouvée", value: "DESAPPROUVED" },
    { label: "Traitée", value: "TREAT" },
    { label: "Non satisfait", value: "UNSATISFIED" },
    { label: "Partiellement satisfait", value: "PARTIAL_SATISFIED" },
    { label: "Satisfait", value: "SATISFIED" },
    { label: "Contentieux", value: "LITIGATION" },
    { label: "Classée", value: "CLASSED" },
  ]);
  const [closeObjet, setCloseObjet] = useState(false);

  const yearOptions = selectableYears()
    .map((year) => ({ label: year, value: year }))
    .concat([{ label: "Toutes ", value: 0 }]);

  const users =
    loadItemFromSessionStorage("app-users") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-users"))
      : [];
  const optionsUsers = users.map((one) => ({
    label: one.firstAndLastName,
    value: one.id,
  }));

  const subjects =
    loadItemFromSessionStorage("app-objets") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-objets"))
      : [];
  const optionsObjet = subjects.map((subject) => ({
    label: subject.libelle,
    value: subject.id,
  }));

  const ps =
    loadItemFromSessionStorage("app-ps") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-ps"))
      : [];
  const optionsUnits = ps.map((unit) => ({
    label: unit.libelle,
    value: unit.id,
  }));

  const products =
    loadItemFromSessionStorage("app-produits") !== undefined
      ? JSON.parse(loadItemFromSessionStorage("app-produits"))
      : [];
  const optionsProducts = products.map((product) => ({
    label: product.libelle,
    value: product.id,
  }));

  const update = (patch) => onChange({ ...value, ...patch });

  const handlePlainteTypeChange = (selected) => {
    const values = (selected ?? []).map((e) => e.value);
    let isSee = false;
    (selected ?? []).forEach((e) => {
      setCloseObjet(values.length === 1 && e.value === "suggestion");
      if (!isSee) {
        if (e.value === "suggestion") {
          setOptionsState([
            { label: "A traiter", value: "SAVED" },
            { label: "Traitée", value: "TREAT" },
          ]);
        } else if (e.value === "denunciation") {
          setOptionsState([
            { label: "A traiter", value: "SAVED" },
            { label: "Affectée", value: "AFFECTED" },
            { label: "Désapprouvée", value: "DESAPPROUVED" },
            { label: "Traitée", value: "TREAT" },
          ]);
        } else {
          isSee = true;
          setOptionsState([
            { label: "A traiter", value: "SAVED" },
            { label: "Affectée", value: "AFFECTED" },
            { label: "Désapprouvée", value: "DESAPPROUVED" },
            { label: "Traitée", value: "TREAT" },
            { label: "Non satisfait", value: "UNSATISFIED" },
            { label: "Partiellement satisfait", value: "PARTIAL_SATISFIED" },
            { label: "Satisfait", value: "SATISFIED" },
            { label: "Contentieux", value: "LITIGATION" },
            { label: "Classée", value: "CLASSED" },
          ]);
        }
      }
    });
    update({ plainteType: values });
  };

  return (
    <div className="row">
      <div className="col s12 m12 l12 input-field">
        <Select
          className="react-select-container mt-4"
          classNamePrefix="react-select"
          style={styles}
          placeholder="Sélectionner l'Année"
          options={yearOptions}
          value={yearOptions.find((o) => o.value === value.year) ?? null}
          onChange={(e) => update({ year: e.value })}
        />
        <label className="active">Année:</label>
      </div>

      <div className="col s12 l12 m12 input-field">
        <label className="active">Type de Plainte</label>
        <Select
          isMulti
          className="react-select-container mt-4"
          classNamePrefix="react-select"
          style={styles}
          placeholder="Tous"
          options={optionsPlainteType}
          value={optionsPlainteType.filter((o) => (value.plainteType ?? []).includes(o.value))}
          onChange={handlePlainteTypeChange}
        />
      </div>

      {!closeObjet && (
        <div className="col s12 l12 m12 input-field">
          <Select
            isMulti
            className="react-select-container mt-4"
            classNamePrefix="react-select"
            style={styles}
            placeholder="Tous"
            options={optionsObjet}
            value={optionsObjet.filter((o) => (value.objet ?? []).includes(o.value))}
            onChange={(e) => update({ objet: (e ?? []).map((o) => o.value) })}
          />
          <label className="active">Objets</label>
        </div>
      )}

      <div className="col s12 m12 l12 input-field">
        <Select
          isMulti
          className="react-select-container mt-4"
          classNamePrefix="react-select"
          style={styles}
          placeholder="Tous"
          options={optionsState}
          value={optionsState.filter((o) => (value.etatState ?? []).includes(o.value))}
          onChange={(e) => update({ etatState: (e ?? []).map((o) => o.value) })}
        />
        <label className="active">Etat de la plainte</label>
      </div>

      <span
        onClick={() => setShowMore(!showMore)}
        className="col l12 m12 s12"
        style={{ cursor: "pointer", color: showMore ? "red" : "blue", textAlign: "center" }}
      >
        {!showMore ? " + Plus" : " - Moins"} d'options
      </span>

      {showMore && (
        <>
          <div className="col s12 m12 l12 input-field">
            <Select
              isMulti
              className="react-select-container mt-4"
              classNamePrefix="react-select"
              style={styles}
              placeholder="Tous"
              options={optionsProducts}
              value={optionsProducts.filter((o) => (value.product ?? []).includes(o.value))}
              onChange={(e) => update({ product: (e ?? []).map((o) => o.value) })}
            />
            <label className="active">Produits</label>
          </div>

          <div className="col s12 m12 l12 input-field">
            <Select
              isMulti
              className="react-select-container mt-4"
              classNamePrefix="react-select"
              style={styles}
              placeholder="Tous"
              options={optionsUsers}
              value={optionsUsers.filter((o) => (value.recoredBy ?? []).includes(o.value))}
              onChange={(e) => update({ recoredBy: (e ?? []).map((o) => o.value) })}
            />
            <label className="active">Enregistrer par</label>
          </div>

          <div className="row">
            <div className="col l12 s12 m12 text-center">Reçu entre:</div>
            <div className="col s12 m12 l6 input-field">
              <DatePicker
                className="mt-4"
                selected={value.startDate ? new Date(value.startDate) : null}
                onChange={(date) => update({ startDate: date })}
                dateFormat="dd/MM/yyyy"
                locale="fr"
              />
              <label className="active">Date de debut</label>
            </div>
            <div className="col s12 m12 l6 input-field">
              <DatePicker
                className="mt-4"
                selected={value.endDate ? new Date(value.endDate) : null}
                onChange={(date) => update({ endDate: date })}
                dateFormat="dd/MM/yyyy"
                locale="fr"
              />
              <label className="active">Date de fin</label>
            </div>
          </div>

          <div className="col s12 m12 l12 input-field">
            <Select
              isMulti
              className="react-select-container mt-4"
              classNamePrefix="react-select"
              placeholder="Tous"
              options={optionsUnits}
              value={optionsUnits.filter((o) => (value.unit ?? []).includes(o.value))}
              onChange={(e) => update({ unit: (e ?? []).map((o) => o.value) })}
            />
            <label className="active">Points de service:</label>
          </div>
        </>
      )}
    </div>
  );
};

export default FiltreRapportForm;
