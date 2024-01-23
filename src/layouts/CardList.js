import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { Typography, Button, Avatar, FormControlLabel, Checkbox, CardHeader, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { red } from '@mui/material/colors';
import { ExpandMore } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { styled } from '@mui/material/styles';

const CardList = ({ cards }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [checkedId, setCheckedId] = React.useState(false);
  const [lastExpandedTitle, setLastExpandedTitle] = useState("");
  const [ide, setIde] = useState("");

  const toggleContent = (id,title) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  
    if (lastExpandedTitle !== "") {
      setLastExpandedTitle("");
    }

    // Mettez à jour le titre du card expansé actuel
    setLastExpandedTitle(title);
    
  };

  const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const handleCheck = (identifiant,e,props) => {
    // setCheckedId(identifiant);
    setCheckedId(e.target.checked ? identifiant : null);
    if (e.target.checked) {
      props.solutionExistantChanged(identifiant)
      
    } else {
      
    }
   
    // console.log("eeeeeeeeeeee",e.target.checked)
  };

  return (
    <div className="card-list">
      {cards?.map((card, index) => (
        <Card key={index} className="mb-4">
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                { parseInt(card.index+1)}
              </Avatar>
            }
            action={
              <FormControlLabel
                control={<Checkbox
                  checked={checkedId === card.id}
                  onChange={(e) => {
                    handleCheck(card.id,e,card.props)
                  }}
                />} 
              />
            }
            
          />
          <CardContent>
            <Typography component="div">
              {/* {card.title} */}
              {expandedId === index ? "" : card.title}
            </Typography>
            <Collapse in={expandedId === index}>
              <Typography variant="body2" >
                {card.content}
              </Typography>
            </Collapse>
          </CardContent>

          <CardActions disableSpacing>
             <IconButton aria-label="favori">
              <FavoriteIcon />
             </IconButton> 
             {card.compteur !== null ? card.compteur : 0}

             {card.taille > 30 ? 
              <ExpandMore
                //  expand={isExpanded}
                onClick={() => toggleContent(index,card)}
                //  aria-expanded={isExpanded}
                aria-label="voir plus"
              >
                <ExpandMoreIcon />
              </ExpandMore> : ""}
          </CardActions>

        </Card>
      ))}
    </div>
  );
};

export default CardList;
