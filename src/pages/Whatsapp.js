import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { addSelectMessage, isFail, isOK, newConvert, removeSelectMessage, reset, resetConvert, resetSelectMessage, setCurrentInbox, setInboxs, setIsLoading, setMessage, setMessageIsLoading, setShowAside, setShowMessage, setStartConvert, toggleIsLoading, toggleMessageIsLoading, toggleShowAside } from '../redux/actions/WhatsappActions';
import { Avatar, AvatarGroup, Badge, Box, Button, Checkbox, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, Paper, styled, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { downloadFilesApi, getList } from '../apis/WhatsappApi';
import { AudioFile, CheckBox, CheckBoxTwoTone, CheckRounded, CheckTwoTone, DownloadDoneTwoTone, DownloadTwoTone, FileDownload, FilePresent, FileUploadRounded, ImageRounded, MailSharp, MenuOpen, MessageRounded, Person, PictureAsPdf, PictureAsPdfOutlined, StickyNote2Rounded } from '@mui/icons-material';
import { Card } from 'react-bootstrap';
import { Dropdown } from '@mui/base/Dropdown';
import { MenuButton, MenuItem } from '@mui/base';

const Container = styled(Box)(({ theme }) => ({
    display: "flex",
    height: "85vh",
    backgroundColor: "#f5f5f5"
}));

const Sidebar = styled(Box)(({ theme }) => ({
    width: 320,
    backgroundColor: "#fff",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("md")]: {
        display: "none"
    }
}));

const ChatArea = styled(Box)({
    flex: 1,
    display: "flex",
    flexDirection: "column"
});


const MessageContainer = styled(Box)({
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    "&::-webkit-scrollbar": {
        width: "4px"
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#e0e0e0",
        borderRadius: "3px"
    }
});

const FileContainer = styled(Box)(({ theme }) => ({
    maxHeight: "200px",
    overflowY: "auto",
    padding: theme.spacing(2),
}));

const FileCard = styled(Paper)(({ theme, sent }) => ({
    padding: theme.spacing(2),
    borderRadius: !sent ? "16px 16px 0 16px" : "16px 16px 16px 0",
    marginBottom: "10px",
    backgroundColor: !sent ? "#2196f3" : "#fff",
    marginTop: "10px",
    maxWidth: "60%",
    minWidth: "20%",
    display: "flex",
    marginLeft: !sent ? "auto" : "0",
    marginRight: !sent ? "0" : "auto",

    alignItems: "center",
    boxShadow: "none",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[4],
    },
}));

const FilePreview = styled(Box)(({ type }) => ({
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: type === "pdf" ? "#ffebee" :
        type === "image" ? "#e3f2fd" :
            type === "document" ? "#e8f5e9" :
                type === "video" ? "#acf5e9" :
                    type === "ptt" ? "#acfaa9" :
                        type === "sticker" ? "#fffaa9" :
                            "#f5f5f5",
    borderRadius: "8px",
}));

const Message = styled(Paper)(({ sent }) => ({
    padding: "10px 16px",
    width: "fit-content",
    borderRadius: !sent ? "16px 16px 0 16px" : "16px 16px 16px 0",
    backgroundColor: !sent ? "#2196f3" : "#fff",
    color: !sent ? "#fff" : "#333",
    maxWidth: "70%",
    minWidth: "20%",
    boxShadow: "none",
    marginBottom: "4px",
    marginLeft: !sent ? "auto" : "0",
    marginRight: !sent ? "0" : "auto",
    position: "relative",
    transition: "all 0.3s ease"
}));
// const MessageContainer = styled(Box)({
//     flex: 1,
//     padding: "20px",
//     overflowY: "auto"
// });

// const Message = styled(Box)(({ sent }) => ({
//     display: "flex",
//     justifyContent: sent ? "flex-end" : "flex-start",
//     marginBottom: "10px"
// }));



const ChatHeader = styled(Box)({
    padding: "15px",
    backgroundColor: "#fff",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    display: "flex",
    alignItems: "center",
    gap: "15px"
});





const Whatsapp = (props) => {


    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        getList(props);

    }, [""])
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const getFileIcon = (type) => {
        switch (type) {

            case "image":
                return <ImageRounded size={40} color="#2196f3" />;
            case "document":
                return <FilePresent size={40} color="#4caf50" />;
            case "audio":
                return <AudioFile size={40} color="#4caf50" />;
            case "ptt":
                return <AudioFile size={40} color="#4caf50" />;
            case "sticker":
                return <StickyNote2Rounded size={40} color="#4caf50" />;
            default:
                return <FileDownload size={40} color="#757575" />;
        }
    };

    const toggleSelect = (msg) => {
        if (props.selectMessage.includes(msg)) {

            props.removeSelectMessage(msg)
        } else {
            props.addSelectMessage(msg)

        }
    }

    const splitFileName = (path) => {
        let newPath = path.split("\\")
        return newPath[newPath.length - 1] + ""
    }


    return (
        <>

            <Container>
                {isMobile && (
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        <Box width={320}>
                            <List>

                                {props.inboxs?.map((inbox) => {

                                    return (<ListItemButton onClick={() => { props.setCurrentInbox(inbox) }} key={inbox.id} sx={{ pl: 1 }} className='lib'>

                                        <ListItemIcon>
                                            <Avatar  ><MessageRounded /></Avatar>
                                        </ListItemIcon>
                                        <ListItemText primary={inbox.phone} secondary={inbox.messages[inbox.messages.length - 1] ? inbox.messages[inbox.messages.length - 1]["content"] : "-"} />
                                    </ListItemButton>)

                                })}

                            </List>
                        </Box>
                    </Drawer>
                )}
                <Sidebar component="aside">
                    <List>
                        <ChatHeader>

                            <Box>
                                <Typography variant="h6"><b>Liste des conversations</b> </Typography>

                            </Box>
                        </ChatHeader>

                        {props.inboxs?.map((inbox) => {

                            return (<ListItemButton onClick={() => { props.setCurrentInbox(inbox) }} key={inbox.id} sx={{ pl: 1 }} className='lib'>

                                <ListItemIcon>
                                    <Avatar  ><Person /></Avatar>
                                </ListItemIcon>
                                <ListItemText primary={inbox.phone} secondary={inbox.messages[inbox.messages.length - 1] ? inbox.messages[inbox.messages.length - 1]["content"] : "-"} />
                            </ListItemButton>)

                        })}

                    </List>
                </Sidebar>
                <ChatArea>
                    {props.currentInbox && (<ChatHeader>
                        {isMobile && (
                            <IconButton
                                onClick={() => setDrawerOpen(true)}
                                aria-label="open contacts"
                            >
                                <MenuOpen />
                            </IconButton>
                        )}
                        <div style={{ display: 'flex', width: "100%" }}>
                            <div style={{ display: 'flex', flex: "1 auto", alignItems: "center" }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    variant="dot"
                                    color="success"
                                >
                                    <Avatar  ><Person /> </Avatar>
                                </Badge>
                                <Box>
                                    <Typography variant="h6" marginLeft={1}>{props.currentInbox.phone} </Typography>
                                </Box>
                            </div>
                            <div>

                                {!props.startConvert ? (<>
                                    <Button variant="contained" style={{ marginRight: "4px" }} onClick={(e) => { props.setStartConvert(true) }} color="primary">
                                        Selectionner
                                    </Button>
                                    <Button variant="outlined" color="error">
                                        Ignorer
                                    </Button></>) :
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <b>{props.selectMessage.length} {props.selectMessage.length > 1 ? "messages" : "message"} dont({props.selectMessage.filter((data) => (data.type !== "chat"))?.length} preuves) </b>
                                        {props.selectMessage.length > 0 && (<Button variant="contained" style={{  marginLeft: "4px" }} color="primary">
                                            Convertir
                                        </Button>)}
                                        <Button variant="contained" onClick={(e) => { props.setStartConvert(false) }} style={{ marginLeft: "4px" }} color="error">
                                            Annuler
                                        </Button>
                                    </div>}

                            </div>
                        </div>
                    </ChatHeader>)}

                    <MessageContainer>
                        {props.messages.map((msg) => (
                            msg.type === "chat" ? <>

                                {props.startConvert && <div style={{ display: "flex", justifyContent: msg.message_id.startsWith("true") ? "flex-end" : "flex-start", marginTop: "5px" }}><Checkbox checked={props.selectMessage.includes(msg)} onClick={() => { toggleSelect(msg) }} inputProps={{ 'aria-label': 'controlled' }} /></div>}
                                <Message key={msg.id} sent={msg.message_id.startsWith("false")}>
                                    {/* <MessageBubble sent={msg.message_id.startsWith("true")} elevation={1}> */}
                                    <Typography>{msg.content}</Typography>
                                    <Typography
                                        variant="caption"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            opacity: 0.7,
                                            marginTop: 4
                                        }}
                                    >
                                        {msg.date}
                                    </Typography>
                                    {/* </MessageBubble> */}
                                </Message></> : <>
                                {props.startConvert && <div style={{ display: "flex", justifyContent: msg.message_id.startsWith("true") ? "flex-end" : "flex-start", marginTop: "5px" }}><Checkbox checked={props.selectMessage.includes(msg)} onClick={() => { toggleSelect(msg) }} inputProps={{ 'aria-label': 'controlled' }} /></div>}
                                <FileCard sent={msg.message_id.startsWith("false")} >
                                    <FilePreview type={msg.type}>
                                        {getFileIcon(msg.type)}
                                    </FilePreview>

                                    <Box display="flex" flex="1 auto" marginLeft="5px" justifyContent="space-between" alignItems="center" mt={1}>
                                        <Typography
                                            variant="subtitle1"
                                            noWrap
                                            title={msg.content}
                                            sx={{ fontWeight: 900 }}
                                        >
                                            {splitFileName(msg.content)}
                                        </Typography>
                                        <Box >

                                            <Tooltip title="Download">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        downloadFilesApi(msg.content);
                                                    }}
                                                >
                                                    <DownloadTwoTone />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                    </Box>
                                </FileCard>
                            </>
                        ))}
                    </MessageContainer>

                </ChatArea>
            </Container>
        </>

    )
}

const mapStateToProps = (state) => {
    return {
        inboxs: state.whatsapp.inboxs,
        messages: state.whatsapp.messages,
        currentInbox: state.whatsapp.currentInbox,
        selectMessage: state.whatsapp.selectMessage,
        showAside: state.whatsapp.showAside,
        isLoading: state.whatsapp.isLoading,
        startConvert: state.whatsapp.startConvert,
        messagesIsLoading: state.whatsapp.messagesIsLoading,
        isSuccess: state.whatsapp.isSuccess,
        message: state.whatsapp.message,
        showMessage: state.whatsapp.showMessage,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        reset: () => {
            dispatch(reset())
        },
        setInboxs: (inboxs) => {
            dispatch(setInboxs(inboxs))
        },
        setCurrentInbox: (currentInbox) => {
            dispatch(setCurrentInbox(currentInbox))
        },
        resetSelectMessage: () => {
            dispatch(resetSelectMessage())
        },
        addSelectMessage: (message) => {
            dispatch(addSelectMessage(message))
        },
        removeSelectMessage: (message) => {
            dispatch(removeSelectMessage(message))
        },
        setShowAside: (isShow) => {
            dispatch(setShowAside(isShow))
        },
        toggleShowAside: () => {
            dispatch(toggleShowAside())
        },
        setIsLoading: (isLoading) => {
            dispatch(setIsLoading(isLoading))
        },
        toggleIsLoading: () => {
            dispatch(toggleIsLoading())
        },
        setStartConvert: (convert) => {
            dispatch(setStartConvert(convert))
        },
        newConvert: () => {
            dispatch(newConvert())
        },
        resetConvert: () => {
            dispatch(resetConvert())
        },
        setMessageIsLoading: (isLoading) => {
            dispatch(setMessageIsLoading(isLoading))
        },
        toggleMessageIsLoading: () => {
            dispatch(toggleMessageIsLoading())
        },
        isOK: (message) => {
            dispatch(isOK(message))
        },
        isFail: (message) => {
            dispatch(isFail(message))
        },
        setMessage: (message) => {
            dispatch(setMessage(message))
        },
        setShowMessage: (isShow) => {
            dispatch(setShowMessage(isShow))
        },

    };
};




export default connect(mapStateToProps, mapDispatchToProps)(Whatsapp);