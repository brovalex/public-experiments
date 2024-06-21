#!/bin/bash
# script to load all kbd file with KMonad
# don't forget to `chmod +x ...` this file
find /dev/input/by-path/*kbd* | while read -r KBD_DEV; do
    {
    echo "$KBD_DEV"
    export KBD_DEV
    KBDCFG=$(envsubst < /home/ab/.config/kmonad/config-all.kbd)
    echo "$KBDCFG"
    kmonad <(echo "$KBDCFG") }
done