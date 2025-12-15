const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');

router.get('/', recipeController.getAllRecipes);

router.get('/:id', recipeController.getRecipeById);

router.get('/menu/:menuItemId', recipeController.getRecipeByMenuItemId);

router.get('/:id/total-time', recipeController.calculateTotalTime);

router.get('/:id/check-ingredients', recipeController.checkIngredientsAvailability);

router.post('/consume', recipeController.consumeRecipe);

router.post('/', recipeController.createRecipe);

router.put('/:id', recipeController.updateRecipe);

router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
