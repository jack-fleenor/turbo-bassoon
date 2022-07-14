import React from 'react';
import axios from 'axios';
import Loading from './Loading';
import RecipeForm from './RecipeForm';
import { List, ListItem, ListItemText, IconButton, Tooltip, Menu, ListItemIcon, ListItemAvatar, Avatar, Dialog, Card, CardMedia, CardContent, Typography, Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/material';
import { MoreVert, Group, AccessTime, ExpandMore, Info } from '@mui/icons-material';
import decimalToFraction from '../utils/mathOperations'

const baseUrl = process.env.REACT_APP_BASE_URL
const recipesGetUrl = process.env.REACT_APP_GET_RECIPES_URL
const specialsGetUrl = process.env.REACT_APP_GET_SPECIALS_URL

const RecipeOptionsMenu = (props) => {
    const [ anchorEl, setAnchorEl ] = React.useState(null);
    const open = Boolean(anchorEl);
    const { recipe } = props;
    
    const expandOptions = (e) => {
        setAnchorEl(e.target)
    };
    
    const closeOptions = (e) => {
        setAnchorEl(null)
    };

    return (
        <>
            <Tooltip title="Options">
                <IconButton onClick={expandOptions} edge="end" aria-label="Options">
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="options-menu"
                open={open}
                onClose={closeOptions}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: 1,
                            mr: -0.5
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 5,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0
                        },
                    }
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <RecipeForm type="edit" recipe={recipe} />
            </Menu>
        </>
    )
}

const RecipeDirectionsSection = (props) => {
    const { instructions, optional, step } = props
    return (
        <CardContent>
            <Typography gutterBottom variant="h5" component="div">
                Step {step}:
            </Typography>
            { optional ?  
                <Typography gutterBottom variant="subtitle" component="div">
                    <i>Optional</i>
                </Typography> : null 
            }
            <Typography variant="body2" color="text.secondary">
                {instructions}
            </Typography>
        </CardContent>
    )
};

const RecipeIngredientsItem = (props) => {
    const { ingredient, specials } = props;

    const isSpecial = (ingredient) => {
        const found = specials.find(special => special.ingredientId === ingredient.uuid);
        if(found === undefined){
            return false;
        } else {
            return found
        }
    }

    const checkAmount = (amount) => {
        let amountString = "";
        if(amount === null){
            return amountString
        }
        else if(Number.isInteger(amount)){
            return amount
        } else {
            if(Math.floor(ingredient.amount) > 0){
                const intAmount = Math.floor(amount)
                const fractionAmount = decimalToFraction(ingredient.amount % 1).display
                amountString = intAmount.toString() + ' ' + fractionAmount
            } else if(Math.floor(ingredient.amount) === 0){
                const fractionAmount = decimalToFraction(ingredient.amount).display
                amountString = '' + fractionAmount
            }
        }
        return amountString
    };
        
    return (
        <ListItem>
            <ListItemText 
                primary={`${checkAmount(ingredient.amount)} ${ingredient.measurement} ${ingredient.name}`} 
                secondary={isSpecial(ingredient) ? 
                <>
                    {isSpecial(ingredient).title + ' ' + isSpecial(ingredient).type.charAt(0).toUpperCase() + isSpecial(ingredient).type.slice(1) + ' Deal!'} <br/>
                    {isSpecial(ingredient).text}
                </> : null } 
            />
        </ListItem>
    )
}

const RecipeModal = (props) => {
    const { onClose, open, recipe, specials } = props;

    const handleClose = () => {
      onClose();
    };
  
    return (
      <Dialog onClose={handleClose} open={open} >
        <Card sx={{maxHeight: 500, overflowY: 'auto'}}>
            <CardMedia alt={recipe.title} height="250" component="img" image={baseUrl + recipe.images.full} />
            <CardContent>
                <Typography gutterBottom variant="h4" component="div">
                    {recipe.title}
                    <RecipeOptionsMenu recipe={recipe} />
                </Typography>
                <Typography variant="h5" color="text.secondary">
                    {recipe.description}
                </Typography>
                <Typography gutterBottom variant="subtitle" component="div">
                    { recipe.postDate >= 0 && recipe.editDate ? `Posted at: ${recipe.postDate}` : `Edited at: ${recipe.editDate}`}
                </Typography>
                <Typography gutterBottom variant="subtitle" component="div">
                    <List component={Stack} direction="row" dense>
                        <ListItem key="recipe_servings">
                            <ListItemIcon><Group fontSize="small" /></ListItemIcon>
                            <ListItemText>{recipe.servings} servings</ListItemText>
                        </ListItem>
                        <ListItem key="recipe_prepTime">
                            <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
                            <ListItemText>{recipe.prepTime} minute prep time</ListItemText>
                        </ListItem>
                        <ListItem key="recipe_cookingTime">
                            <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
                            <ListItemText>{recipe.cookTime} minute cooking time</ListItemText>
                        </ListItem>
                    </List>
                </Typography>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h5" color="text.secondary">
                            Ingredients
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            {recipe.ingredients && recipe.ingredients.map(ingredient => {
                                return <RecipeIngredientsItem key={ingredient.uuid} ingredient={ingredient} specials={specials} />
                            })}
                        </List>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h5" color="text.secondary">
                            Directions
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {recipe.directions && recipe.directions.map((direction, index) => {
                            return <RecipeDirectionsSection key={index} instructions={direction.instructions} optional={direction.optional} step={index + 1} />
                        })}
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
      </Dialog>
    );
}

const RecipesListItem = (props) => {
    const [ openModal, setOpenModal] = React.useState(false);
    const { recipe, specials } = props;

    const handleOpenModal = () => {
        setOpenModal(true)
    };

    const handleCloseModal = () => {
        setOpenModal(false)
    };

    return (
        <ListItem
            secondaryAction={
                <Tooltip title="Check it out!">
                    <IconButton sx={{ textTransform: 'none' }} onClick={handleOpenModal}><Info color="primary" /></IconButton>
                </Tooltip>
            }
        >
            <ListItemAvatar>
                <Avatar variant="rounded" alt={recipe.title} src={baseUrl + recipe.images.small} sx={{ width: 56, height: 56, marginRight: 5 }} />
            </ListItemAvatar>
            <ListItemText primary={recipe.title} secondary={recipe.description} />
            <RecipeModal open={openModal} onClose={handleCloseModal} recipe={recipe} specials={specials} />
        </ListItem>
    )
};

const RecipesList = (props) => {
    const { recipes, specials } = props;
    return (
        <List>
            {
                recipes && recipes.map(
                    (recipe) => 
                    <RecipesListItem key={recipe.uuid} recipe={recipe} specials={specials} />
                )
            }
        </List>
    )
};

const Recipes = () => {
    const [ recipes, setRecipes ] = React.useState(null);
    const [ specials, setSpecials ] = React.useState(null);

    React.useEffect(() => {
        axios.get(recipesGetUrl)
        .then((response) => { return response.data })
        .then((json) => { setRecipes([...new Set(json)]) })
        .catch((error) => console.error(error))
        axios.get(specialsGetUrl)
        .then((response) => { return response.data })
        .then((json) => {
            setSpecials([...new Set(json)])
        })
        .catch((error) => console.error(error))
    }, []);

    return (
        <>            
            {
                recipes ? <RecipesList recipes={recipes} specials={specials} /> : <Loading />
            }
            <RecipeForm type="create" />
        </>
    )
};

export default Recipes;