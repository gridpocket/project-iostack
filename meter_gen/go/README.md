# Install golang (https://golang.org/dl/)

```sh
# ex for v1.8.3/linux amd64:
wget "https://storage.googleapis.com/golang/go1.8.3.linux-amd64.tar.gz"

# extract go.tar.gz in /usr/local folder
tar -C /usr/local -xzf go1.8.3.linux-amd64.tar.gz

# export variable to access go from everywhere
export PATH=$PATH:/usr/local/go/bin

# remove tar.gz file
rm go1.8.3.linux-amd64.tar.gz
```

# Check working

```sh
# in folder project-iostack/meter_gen
sh ./go/compile.sh
sh ./workingTest/workingTest-go.sh
```