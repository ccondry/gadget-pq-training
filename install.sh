#!/bin/sh
echo "creating gadget folder..."
mkdir -p /var/www/gadgets/pq-training/
echo "copying gadget files..."
cp -rf pq-training/* /var/www/gadgets/pq-training/
echo "install gadget-pq-training is complete"
