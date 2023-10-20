# Lisp notification service

This small service is part of the [Lisp](https://github.com/Koenigseder/lisp) ecosystem to inform people over updates made to their lists via push notifications.

# How it works

Since Lisp uses Firestore to store information, we can build a custom trigger that listens for any changes.
