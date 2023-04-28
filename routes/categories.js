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
    try {
        const { username, character, comment } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send({ error: "Category not found" });
        }

        // Check if the user has already voted in this category
        const existingVote = category.votes.find((vote) => vote.user === username);
        if (existingVote) {
            return res.status(400).send({ error: "User has already voted in this category" });
        }

        category.votes.push({ character, user: username, comment });
        await category.save();

        res.status(201).send({ message: "Vote added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occurred while submitting your vote" });
    }
});

// Get voting results for a category
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();

        // Compute winners and vote count for each category
        const categoriesWithWinners = categories.map((category) => {
            // Calculate the winner and vote count based on your current logic
            const voteCountMap = {};

            category.votes.forEach((vote) => {
                if (!voteCountMap[vote.character]) {
                    voteCountMap[vote.character] = 1;
                } else {
                    voteCountMap[vote.character]++;
                }
            });

            let winnerCharacter = null;
            let winnerVoteCount = 0;

            for (const [character, count] of Object.entries(voteCountMap)) {
                if (count > winnerVoteCount) {
                    winnerCharacter = character;
                    winnerVoteCount = count;
                }
            }

            return {
                ...category.toObject(),
                winner: winnerCharacter,
                voteCount: winnerVoteCount,
            };
        });

        res.status(200).send(categoriesWithWinners);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "An error occurred while fetching categories" });
    }
});

module.exports = router;