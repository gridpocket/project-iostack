# @Author: Nathaël Noguès
# @Date:   2017-07-31
# @Last Modified by:   Nathaël Noguès
# @Last Modified time: 2017-08-17 13:08:50

#echo $(dirname "$(readlink -f "$0")")/meter_gen $@
$(dirname "$(readlink -f "$0")")/meter_gen $@
