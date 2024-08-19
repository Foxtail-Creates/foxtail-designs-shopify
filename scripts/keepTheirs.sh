#!/bin/bash
echo "Custom merge driver called" >> /tmp/merge.log
echo "Current: $2" >> /tmp/merge.log
echo "Other: $3" >> /tmp/merge.log
mv -f $3 $2
exit 0