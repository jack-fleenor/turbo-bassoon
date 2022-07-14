import React from 'react';
import axios from 'axios';
import * as uuid from 'uuid';
import { Formik, Form, FieldArray, useField, Field } from 'formik';
import { Button, TextField, Dialog, DialogTitle, MenuItem, ListItemText, ListItemIcon, IconButton, Divider, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const recipesPostUrl = process.env.REACT_APP_POST_RECIPES_URL

const TextFieldWrapper = ({name, customStyle, ...otherProps}) => {
    const [field] = useField(name);
    const configTextField = {
      ...otherProps,
      ...field,
      multiline: otherProps.multiline ? true : false,
      rows: otherProps.multiline ? 4 : 1,
      variant: "outlined"
    };

    return (
        <TextField 
            sx={customStyle}
            label={otherProps.label}
            {...configTextField}
        />
    )
}

const RecipeDialog = (props) =>{
    const { onClose, open, values, type } = props;

    const handleClose = () => {
      onClose();
    };

    const handleFormSubmission = (values) => {
        console.log(values, recipesPostUrl, type);
        if(type === "edit"){
            axios.patch(recipesPostUrl, values).then(res => alert(res.message)).catch(err => alert(`Unfortunately, this axios request does not seem to work. The url will return a 404. Example: ${err.message}`));
        } else if(type === "create"){
            axios.post(recipesPostUrl, values).then(res => alert('Success!')).catch(err => alert(err.message));
        }
    }
    
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>{type === "edit" ? 'Edit Recipe' : 'Create Recipe'}</DialogTitle>
            <Formik onChange={(values) => {console.log(values, ' vales')}} enableReinitialize={true} initialValues={values} onSubmit={ (values) => handleFormSubmission(values) }>
                {({ values }) => (
                    <Form>
                        <TextFieldWrapper name="title" label="Title" customStyle={{margin: '0 5% 2.5%', width: '90%'}} />
                        <TextFieldWrapper name="description" label="Description" customStyle={{margin: '0 5% 2.5%', width: '90%'}} />
                        <TextFieldWrapper name="servings" label="Servings" type="number" customStyle={{margin: '0 5% 2.5%', width: '90%'}} />
                        <TextFieldWrapper
                            name="prepTime"
                            type="number"
                            label="Prep Time"
                            customStyle={{margin: '0 2.5% 2.5% 5%', width: '41%'}}
                        />
                        <TextFieldWrapper
                            name="cookTime"
                            type="number"
                            label="Cook Time"
                            customStyle={{margin: '0 2.5% 2.5% 5%', width: '41%'}}
                        />
                        <FieldArray name="ingredients">
                            {({ remove, push }) => (
                                <>
                                    {
                                        values.ingredients.map((ingredient, index) => {
                                            return (
                                                <div key={ingredient.uuid}>
                                                    <TextFieldWrapper
                                                        customStyle={{margin: '0 2.5% 2.5% 5%', width: '23%'}}
                                                        name={`ingredients[${index}].name`}
                                                        label="Ingredient"
                                                    />
                                                    <TextFieldWrapper
                                                        customStyle={{margin: '0 2.5% 2.5% 5%', width: '23%'}}
                                                        name={`ingredients[${index}].amount`}
                                                        label="Amount"
                                                        type="number"
                                                        />
                                                    <TextFieldWrapper
                                                        customStyle={{margin: '0 2.5% 2.5% 5%', width: '23%'}}
                                                        name={`ingredients[${index}].measurement`}
                                                        label="Measurement"
                                                        />
                                                    <IconButton sx={{width: '5%'}} onClick={() => remove(index)}><Delete/></IconButton>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button
                                        onClick={() => push({ uuid: uuid.v4(), amount: 0, measurement: "Measurement", name: "Name" })}
                                        sx={{
                                            paddingLeft: '5%',
                                            paddingRight: '5%', 
                                            paddingBottom: '5%',
                                            width: '100%'
                                        }}>
                                        Add Ingredient
                                    </Button>
                                </>
                                )
                            }
                        </FieldArray>
                        <FieldArray name="directions">
                            {({ remove, push }) => (
                                <>
                                    {
                                        values.directions.map((direction, index) => {
                                            return (
                                                <div key={index}>
                                                    <TextFieldWrapper
                                                        name={`directions[${index}].instructions`}
                                                        label={`Step: ${index + 1}`}
                                                        multiline={true}
                                                        customStyle={{margin: '0 5% 2.5%', width: '80%'}}
                                                    />
                                                    <IconButton sx={{width: '5%'}} onClick={() => remove(index)}><Delete/></IconButton>
                                                    <Typography sx={{width: '100%', paddingBottom: 3, paddingLeft: 5}}>
                                                        Optional: <Field type="checkbox" name={`directions[${index}].optional`} />
                                                    </Typography>
                                                    <Divider sx={{width: '100%', marginBottom: 5 }} />
                                                </div>
                                            )
                                        })
                                    }
                                    <Button
                                        onClick={() => push({ instructions: "Add sugar, spice, and everything nice.", optional: false })}
                                        sx={{
                                            paddingLeft: '5%',
                                            paddingRight: '5%', 
                                            paddingBottom: '5%',
                                            width: '100%'
                                        }}
                                    >
                                        Add Step
                                    </Button>
                                </>
                            )}
                        </FieldArray>
                        <Button color="primary" variant="contained" sx={{margin: '0 5% 2.5%', width: '40%'}} type="submit">
                            Submit
                        </Button>
                        <Button color="primary" onClick={handleClose} variant="outlined" sx={{margin: '0 5% 2.5%', width: '40%'}}>
                            Cancel
                        </Button>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

const RecipeForm = (props) => {
    const { type, recipe } = props;
    const [open, setOpen] = React.useState(false);
    
    const templatedRecipe = {
        uuid: uuid.v4(),
        title: "Name your favorite recipe...",
        description: "Describe your delicious recipe...",
        images: {
          full: "",
          medium: "",
          small: ""
        },
        servings: 0,
        prepTime: 0,
        cookTime: 0,
        postDate: new Date(),
        editDate: new Date(),
        ingredients: [
          {
            uuid: uuid.v4(),
            amount: 0,
            measurement: "cups",
            name: "Dune Spice",
          }
        ],
        directions: [
            {
                instructions: "How do you make this dish?",
                optional: false
            }
        ]
    }

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = (value) => {
      setOpen(false);
    };
  
    return (
      <>
        {
            type === "edit" ? 
            <MenuItem aria-label="edit" onClick={handleClickOpen}>
                <ListItemIcon>
                    <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
            </MenuItem> :
            <Button variant="outlined" onClick={handleClickOpen} sx={{textTransform: 'none', marginBottom: '15px'}}>
                Add New Recipe
            </Button>
        }
        <RecipeDialog
          open={open}
          onClose={handleClose}
          values={type === "edit" ? recipe : templatedRecipe}
          type={type}
        />
      </>
    );
}

export default RecipeForm