const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new category
router.post("/", async (req, res) => {
    const category = new Category(req.body);

    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a category
router.put("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a category
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Set the current voting category
router.put("/setCurrent/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Set all categories to not open
        await Category.updateMany({}, { isOpen: false });

        // Set the selected category to open
        const updatedCategory = await Category.findByIdAndUpdate(id, { isOpen: true }, { new: true });
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add a vote
router.post("/:id/vote", async (req, res) => {
    const { id } = req.params;
    const vote = req.body;

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.votes.push(vote);
        await category.save();

        res.status(201).json({ message: "Vote added successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get voting results for a category
router.get("/:id/results", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Calculate the voting results
        const voteCount = {};
        category.votes.forEach(vote => {
            if (voteCount[vote.character]) {
                voteCount[vote.character]++;
            } else {
                voteCount[vote.character] = 1;
            }
        });

        const results = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
        const winner = results[0];

        // Return the winner and their vote count
        res.json({ winner: winner[0], voteCount: winner[1] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;