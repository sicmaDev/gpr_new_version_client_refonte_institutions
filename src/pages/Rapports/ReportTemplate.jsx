import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { connect } from "react-redux";
import TemplateActions from "../../redux/actions/Rapports/TemplateActions";
import {
  createOrUpdateTemplateApi,
  deleteTemplateApi,
  reportTemplateApi,
} from "../../apis/Rapports/GlobalsApi";
import { notify } from "../../Utils/alert";

const ReportTemplate = (props) => {
  const closeForm = () => {
    props.setTmpState({
      showForm: false,
      form: { id: null, valeurs: {}, title: null, default: false },
    });
  };
  const getTemplates = () => {
    closeForm();
    reportTemplateApi()
      .then(({ data }) => {
        const current =
          data.content.find((re) => re.default === true) ??
          props.tmpState.tmpInit;
        props.setTmpState({
          isLoading: false,
          isSuccess: true,
          items: [...data.content, props.tmpState.tmpInit],
          current,
          current_valeurs: current.valeurs,
          current_id: current.id,
        });
      })
      .catch((err) => {
        props.setTmpState({
          isLoading: false,
          isSuccess: false,
          showMessage: true,
          message: err,
          items: [props.tmpState.tmpInit],
          current: props.tmpState.tmpInit,
          current_id: 0,
        });
      });
  };

  useEffect(() => {
    getTemplates();
  }, []);

  const handleSubmit = (isCreate = false) => {
    if(!props.tmpState.form.title || props.tmpState.form.title === ""){
        notify("le nom du template est obligatoire","error")
        return 
    }
    createOrUpdateTemplateApi({
      ...props.tmpState.form,
      id: isCreate ? null : props.tmpState.current_id,
      valeurs: props.tmpState.current_valeurs,
    })
      .then(({ data }) => {
        console.log("data", data);
        props.setTmpState({ showForm: false });

        getTemplates();
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const deleteSubmit = () => {
    deleteTemplateApi(props.tmpState.current_id)
      .then(({ data }) => {
        console.log("data Delete", data);
        getTemplates();
      })
      .catch((err) => {
        console.log("err Delete", err);
      });
  };
  const setNewTemplate = (e) => {
    const current =
      props.tmpState.items.find(({ id }) => id === e.target.value) ??
      props.tmpState.tmpInit;
    props.setTmpState({
      current,
      current_id: current.id,
      current_valeurs: current.valeurs,
    });
  };
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ p: 3 }}>
      {props.tmpState.showForm ? (
        <Paper
          elevation={3}
          sx={{ p: 2, borderRadius: 2, position: "relative" }}
        >
          <CardHeader
            title={
              props.tmpState.showCreateForm
                ? "Nouveau Template"
                : "Éditer Template"
            }
            action={
              <IconButton
                aria-label="fermer"
                onClick={closeForm}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>
            }
          />

          <Divider sx={{ mb: 2 }} />
          <CardContent>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Titre"
                value={props.tmpState.form.title}
                onChange={(e) =>
                  props.setTmpState({
                    form: { ...props.tmpState.form, title: e.target.value },
                  })
                }
              />
              <div className="" style={{width:'fit-content'}}>
                <FormControlLabel
                control={
                  <Checkbox
                  checked={props.tmpState.form.default}
                    onChange={(e) => {
                      props.setTmpState({
                        form: {
                          ...props.tmpState.form,
                          default: e.target.checked,
                        },
                      });
                    }}
                  />
                }
                label="Template par défaut ? "
              />
              </div>
         

              <input
                type="checkbox"
                className="form form-control"
                checked={props.tmpState.form.default}
                onChange={(e) =>
                  props.setTmpState({
                    form: {
                      ...props.tmpState.form,
                      default: e.target.checked,
                    },
                  })
                }
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {props.tmpState.showCreateForm ? (
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      handleSubmit(true);
                    }}
                    color="primary"
                  >
                    Enregistrer
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        handleSubmit(false);
                      }}
                      color="warning"
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        deleteSubmit();
                      }}
                      color="error"
                    >
                      Supprimer
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <CardHeader
            title="Gestion des templates"
            action={
              <>
                <IconButton onClick={toggleExpand}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </>
            }
            onClick={toggleExpand}
            sx={{ cursor: "pointer" }}
          />
          <Collapse in={expanded}>
            <Divider sx={{ mb: 2 }} />

            <CardContent>
              <Stack spacing={2}>
                <Select
                  fullWidth
                  value={props.tmpState.current_id}
                  onChange={setNewTemplate}
                  variant="outlined"
                >
                  {props.tmpState.items.map((item, i) => (
                    <MenuItem key={i} value={item.id}>
                      {item.title}
                    </MenuItem>
                  ))}
                </Select>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() =>
                      props.setTmpState({
                        showForm: true,
                        showCreateForm: true,
                        form: { id: null, title: null, default: false },
                      })
                    }
                  >
                    Nouveau
                  </Button>
                  {props.tmpState.current_id !== 0 && (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        props.setTmpState({
                          showForm: true,
                          showCreateForm: false,
                          form: {
                            id: props.tmpState.current.id,
                            title: props.tmpState.current.title,
                            default: props.tmpState.current.default,
                          },
                        })
                      }
                    >
                      Modifier
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Collapse>
        </Paper>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => ({ tmpState: state.templates });
const mapDispatchToProps = (dispatch) => ({
  setTmpState: (data) => dispatch(TemplateActions.stateChanged(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportTemplate);
