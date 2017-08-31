#!/bin/bash

####################################################################################
#
# SwiftEnv gathers all Swift related constant definitions. Used in 
#
# Yosef Moatti   moatti@il.ibm.com
# 2d June 017
#
# version 2.1
# Comment with assumptions added ( no holes in IP address blocks )
# 2.0
# Initial version
#
####################################################################################

OBJECT_BASEIP="10.30.1.24"    ### This is the base name for the swift object nodes where the pipe command should be run.  At Arctur:  "object"
PROXY_BASEIP="10.30.1.5"      ### This is the base name for the swift proxy nodes where the pipe command should be run.  At Arctur:  "proxy"

### Assumption is that the IPs for the swift proxies are a block of IP addresses (without holes)
### Same for the swift object nodes

OBJECT_MAX=3                  ### 3 for e.g.,  object1 object2 object 3.   if 0, only the basename will be used, e.g., proxy
PROXY_MAX=1                   ### 1 for e.g.,  a single node, proxy


