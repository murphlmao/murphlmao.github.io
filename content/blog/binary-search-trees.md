---
title: "Binary Search Trees"
date: '2025-12-12'
order: 1
description: "Binary search trees are lowkey like trees.. that grew from seeds from Australia. All upside down n shii."
tags: ['C++', 'cpp', 'C-lang', 'C', 'programming', 'iterators', 'containers', 'sets', 'maps', 'vectors', 'binary search tree', 'BST', 'recursion']
---


## What is a binary tree?
A binary tree is a data structure where each node has at most two children, referred to as the left child and the right child. Binary trees are used to represent hierarchical data and are fundamental in various algorithms and applications, such as searching, sorting, and expression parsing.

One important definition to know is an invariant. An invariant is a condition or property that must always be true throughout the lifetime of a data structure, no matter what operations are performed on it. **It is a rule that can never be broken**.

## What is a Binary Search Tree (BST)?
A Binary Search Tree is a special kind of binary tree that maintains a sorting invariant on its elements (meaning it literally just keeps everything in order with no exceptions). The invariant is simple: for every node, all values in the left subtree must be smaller, and all values in the right subtree must be larger.

This invariant gives us the best of both worlds:
- Fast lookup like a sorted array (thanks to binary search)
- Efficient insertions and deletions like a linked list

**Example:**
```
        5
       / \
      3   8      ← For node 5: left (3) < 5 < right (8)
     / \   \
    1   4   9    ← For node 3: left (1) < 3 < right (4)
```

### What constitutes a valid BST?
In a valid BST, the following conditions must hold true:

- An empty tree is a valid BST.
- A single node tree is a valid BST.
- All elements in the left subtree are less than the node's value.
- All elements in the right subtree are greater than the node's value.
- Both left and right subtrees must also be valid BSTs.


## Basic Operations on a BST
This code block covers some simple operations on a BST:
- Finding the minimum and maximum values
- Checking if a value exists in the tree
- Inserting a new value

```cpp
#include <iostream>

struct TreeNode {
  int data;
  TreeNode* left;
  TreeNode* right;

  TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

class BST {
  public:
    TreeNode* root;

    BST() : root(nullptr) {}

    int min(TreeNode* node) {
      if (!node->left) {
        return node->data;
      }
      return this->min(node->left);
    }

    int max(TreeNode* node) {
      if (!node->right) {
        return node->data;
      }
      return this->max(node->right);
    }

    bool contains(TreeNode* node, int val) {
      if (!node) {
        return false;
      }

      if (node->data == val) {
        return true;
      }

      if (val < node->data) {
        return this->contains(node->left, val);
      }

      return this->contains(node->right, val);
    }

    TreeNode* insert(TreeNode* node, int val) {
      if (!node) {
        return new TreeNode(val);
      }

      if (val < node->data) {
        node->left = this->insert(node->left, val);
      } else if (val > node->data) {
        node->right = this->insert(node->right, val);
      }

      return node;
    }

    int count(TreeNode* node) {
      if (!node) return 0;
      return 1 + this->count(node->left) + this->count(node->right);
    }

    int sum(TreeNode* node) {
      if (!node) return 0;
      return node->data + this->sum(node->left) + this->sum(node->right);
    }

    void inorder(TreeNode* node) {
      if (!node) return;
      this->inorder(node->left);
      std::cout << node->data << " ";
      this->inorder(node->right);
    }

    void buildTestTree() {
      this->root = new TreeNode(5);
      this->root->left = new TreeNode(3);
      this->root->right = new TreeNode(8);
      this->root->left->left = new TreeNode(1);
      this->root->left->right = new TreeNode(4);
      this->root->right->right = new TreeNode(9);
    }
};

int main() {
  BST tree;
  tree.buildTestTree();

  std::cout << "Tree (in-order): ";
  tree.inorder(tree.root);
  std::cout << std::endl;

  std::cout << "Min: " << tree.min(tree.root) << std::endl;
  std::cout << "Max: " << tree.max(tree.root) << std::endl;
  std::cout << "Contains 4: " << tree.contains(tree.root, 4) << std::endl;
  std::cout << "Contains 7: " << tree.contains(tree.root, 7) << std::endl;
  std::cout << "Count: " << tree.count(tree.root) << std::endl;
  std::cout << "Sum: " << tree.sum(tree.root) << std::endl;

  return 0;
}
```