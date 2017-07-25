/**
 * GridPocket Copyrights 2017
 * IOSTACK project www.iostack.eu
 *
 * @Author: Nathaël Noguès, GridPocket SAS
 * @Date:   2017-07-13
 * @Last Modified by:   Nathaël Noguès
 * @Last Modified time: 2017-07-25
**/

package meter_gen

import (
	"fmt"
	"ioutil"
	"meter_gen-utils"
	"os"
	"strconv"
	"strings"
	"time"
)

func GetParameters(args []string) Params {
	if IndexOf(args, "-h") >= 0 || IndexOf(args, "--help") {
		ifHelp()
	}

	var argsMap = argsToMap(args)
	params, errCount := loadConfig(argsMap)
	if errCount > 0 {
		fmt.Print(errCount)
		fmt.Println(" errors found, execution stop.")
		os.Exit(1) // parameters error
	}
	return params
}

func ifHelp() {
	help, err := ioutil.ReadFile(GetMeterGenDir() + "/usageMessage.txt")
	if err != nil {
		panic(err)
	}

	fmt.Println(help)
	os.Exit(0) // not an error
}
func argsToMap(args []string) map[string]string {
	var argsMap = make(map[string]string)

	// reading all arguments one by one
	for len(args) > 0 {
		var a = args[0]
		args = args[1:] // shift array

		if a[0] == '-' {
			if len(args) > 0 {
				// get argument, and pushing to map
				argsMap[a[1:]] = args[0]
				args = args[1:] // shift array
			} else {
				argsMap[a[1:]] = ""
			}
		} else {
			// argument wasn't starting with '-', certainly an error.
			// Push it to map, will print error for this argument
			argsMap[a] = ""
		}
	}

	return argsMap
}

func loadConfig(argsMap map[string]string) (Params, int) {
	paramsMap, errors := loadConfigRecursive(argsMap, 0, make([]string, 0))

	var param Params
	var dateFormat = "2006-01-02"

	// Check missing not optional parameters here
	for _, key := range []string{"metersNumber", "beginDate", "endDate", "interval"} {
		if _, hasKey := paramsMap[key]; !hasKey {
			fmt.Println("ERROR: " + key + " need to be specified")
			errors++
		}
	}

	// Importing parameters to Params object and checking format and values
	var err error
	for key, value := range paramsMap {
		switch key {
		case "metersNumber": // uint64
			param.metersNumber, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not a positive integer\n", value)
				errNb++
			} else if param.metersNumber <= 0 {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is lower than 1\n", value)
				errNb++
			}
			break
		case "beginDate": // string: 'YYYY-MM-DD' > time.Time
			param.beginDate, err = time.Parse(dateFormat)
			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not 'YYYY-MM-DD'\n", value)
				errors++
			}
			break
		case "endDate": // string: 'YYYY-MM-DD' > time.Time
			param.endDate, err = time.Parse(dateFormat)
			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not 'YYYY-MM-DD'\n", value)
				errors++
			}
			break
		case "interval": // int > time.Duration
			var interval int
			interval, err := strconv.Atoi(value)

			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not a positive integer\n", value)
				errNb++
			} else if interval <= 0 {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is lower than 1\n", value)
				errNb++
			} else {
				param.interval = time.Duration(interval) * time.Minute
			}
			break
		case "metersType": // string:
			param.metersType = value
			break
		case "maxFileSize": // string: [1-9][0-9]*[obkmg] > uint64
			var unite = strings.ToLower(value)[len(value)-1]
			var maxFileSize int
			maxFileSize, err = strconv.Atoi(value[:len(value)-1])
			params.maxFileSize = uint64(maxFileSize)

			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not a positive integer followed by 'o'/'B', 'k', 'M' or 'G'\n", value)
				errNb++
			} else if params.maxFileSize <= 0 {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is lower than 1B\n", value)
				errNb++
			}

			switch unite {
			case 'g':
				params.maxFileSize *= 1024 // gigabyte
			case 'm':
				params.maxFileSize *= 1024 // megabyte
			case 'k':
				params.maxFileSize *= 1024 // kilobyte
			case 'o': // octet (French 'byte')
			case 'b': // byte
				break
			default:
				fmt.Printf("ERROR: Wrong "+key+", '%v' is a positive integer not followed by 'o'/'B', 'k', 'M' or 'G'\n", value)
				errNb++
			}
			break
		case "startID": // uint64
			param.startID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not a positive integer\n", value)
				errNb++
			} else if param.startID <= 0 {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is lower than 1\n", value)
				errNb++
			}
			break
		case "lastID": // uint64
			param.lastID, err = strconv.ParseUint(value, 10, 64)

			if err != nil {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is not a positive integer\n", value)
				errNb++
			} else if param.lastID <= 0 {
				fmt.Printf("ERROR: Wrong "+key+", '%v' is lower than 1\n", value)
				errNb++
			}
			break
		case "temp": // bool
			if value == "" {
				param.temp = true
			} else {
				param.temp, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf("ERROR: Wrong "+key+", '%v' is not a boolean (true/t/1, false/f/0)\n", value)
					errors++
				}
			}
			break
		case "location": // bool
			if value == "" {
				param.location = true
			} else {
				param.location, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf("ERROR: Wrong "+key+", '%v' is not representing a boolean\n", value)
					errors++
				}
			}
			break
		case "consumptionsFile": // string
			param.consumptionsFile = value
			break
		case "climatFile": // string
			param.climatFile = value
			break
		case "meteoFile": // string
			param.meteoFile = value
			break
		case "locationsFile": // string
			param.locationsFile = value
			break
		case "out": // string
			param.out = value
			break
		case "debug": // bool
			if value == "" {
				param.debug = true // bool
			} else {
				param.debug, err = strconv.ParseBool(strings.ToLower(value))
				if err != nil {
					fmt.Printf("ERROR: Wrong "+key+", '%v' is not representing a boolean\n", value)
					errors++
				}
			}
			break
		default:
			fmt.Printf("ERROR: Unrecognized parameter '"+key+"', value: '%v'\n", value)
			errors++
		}
	}

	// Check parameters compatibility (beginDate < endDate etc..)
	//
	//  TODO
	//

	return param, errors
}

func loadConfigRecursive(argsMap map[string]string, errors int, recursive []string) (map[string]string, bool) {
	var params = make(map[string]string)
	var defaultConfigFileUsed = 0 // avoid looping on default config files

	if _, isConfig := argsMap["config"]; !isConfig {
		// If no config file specified, and there is a ./config.json
		// use it as default config file
		if defaultConfigFileUsed == 0 && FileExists(GetExecutionDir()+"/config.json") {
			argsMap["config"] = GetExecutionDir() + "/config.json"
			defaultConfigFileUsed = 1 // flag 'first config file treated'
		} else if FileExists(GetMeterGenDir() + "/config.json") {
			argsMap["config"] = GetMeterGenDir() + "/config.json"
			defaultConfigFileUsed = 2 // flag 'all config files treated'
		} else {
			defaultConfigFileUsed = 2 // flag 'all config files treated'
		}
	}

	configPath, isConfig := argsMap["config"]
	if isConfig {
		if IndexOf(recursive, configPath) >= 0 {
			if defaultConfigFileUsed < 2 {
				fmt.Print("ERROR: -config loop detected: " + configFile + " is directly or indirectly referencing itself.")
				errors++
			}
		} else {
			var jsonConfig map[string]interface{}

			fileStr, err := ioutil.ReadFile(configPath)
			if err != nil {
				panic(err)
			}

			err := json.Unmarshal(fileStr, &jsonConfig) // get config file as json object
			if err != nil {
				panic(err)
			}

			if _, hasConfig := jsonConfig["config"]; hasConfig {
				argsMap["config"] = jsonConfig["config"]
			} else {
				delete(argsMap, "config")
			}
			delete(jsonConfig, "config")

			// Add this file name to 'recursive' list, to maybe later detect recursivity loop
			recursive = append(recursive, configPath)

			// Get herited parameters
			params, errors = loadConfigRecursive(jsonConfig, 0, recursive)
		}
	}

	// Add new and rewrited parameters
	for key, _ := range argsMap {
		params[key] = argsMap[key]
	}

	return params, errors
}
