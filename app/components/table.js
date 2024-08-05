"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { db } from "@/firebase";
import {
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  onSnapshot,
} from "firebase/firestore";

const ItemTable = ({ collectionName }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    const collectionRef = collection(db, collectionName);

    // Set up real-time listener
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(items);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [collectionName]);

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, items]);

  const handleIncrease = async (id) => {
    await increaseCount(collectionName, id);
  };

  const handleDecrease = async (id) => {
    const item = items.find((item) => item.id === id);
    if (item && item.count > 1) {
      await decreaseCount(collectionName, id);
    } else if (item && item.count === 1) {
      await removeItem(collectionName, id);
    }
  };

  const handleDelete = async (id) => {
    await removeItem(collectionName, id);
  };

  const handleAddItem = async () => {
    if (newItemName.trim()) {
      await addItem(collectionName, { name: newItemName, count: 1 });
      setNewItemName("");
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add New Item
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          label="Item Name"
          variant="outlined"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button onClick={handleAddItem} variant="contained" color="primary">
          Add
        </Button>
      </Box>
      <TextField
        label="Search Items"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} sx={{ minWidth: 650 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Item</TableCell>
              <TableCell align="center">Item Count</TableCell>
              <TableCell align="center" sx={{ width: 200 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell align="center">{item.name}</TableCell>
                <TableCell align="center">{item.count}</TableCell>
                <TableCell align="center" sx={{ width: 200 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    <Button
                      onClick={() => handleDecrease(item.id)}
                      variant="contained"
                      color="warning"
                      size="small"
                    >
                      -
                    </Button>
                    <Button
                      onClick={() => handleIncrease(item.id)}
                      variant="contained"
                      color="warning"
                      size="small"
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="contained"
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

async function removeItem(collectionName, itemId) {
  try {
    const docRef = doc(db, collectionName, itemId);
    await deleteDoc(docRef);
    console.log("Document successfully deleted");
  } catch (e) {
    console.error("Error removing document: ", e);
  }
}

async function increaseCount(collectionName, itemId) {
  try {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, {
      count: increment(1),
    });
    console.log("Count successfully increased");
  } catch (e) {
    console.error("Error increasing count: ", e);
  }
}

async function decreaseCount(collectionName, itemId) {
  try {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, {
      count: increment(-1),
    });
    console.log("Count successfully decreased");
  } catch (e) {
    console.error("Error decreasing count: ", e);
  }
}

export async function addItem(collectionName, itemData) {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, itemData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export default ItemTable;
