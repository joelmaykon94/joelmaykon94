#!/bin/bash

# Simple script to run OpenRewrite quality checks across the workspace
MOD_CLI="/home/joelmaykon/.moderne/cli/bin/mod"

echo "Checking Java projects..."
for pom in $(find java -name "pom.xml"); do
    dir=$(dirname $pom)
    echo "Processing $dir..."
    (cd $dir && ./mvnw rewrite:run -DactiveRecipes=com.atomant.QualityAndPerformance)
done

echo "Checking Angular and Python projects using Moderne CLI..."
if [ -f "$MOD_CLI" ]; then
    $MOD_CLI build .
    $MOD_CLI run . --recipe com.atomant.QualityAndPerformance
    echo "Done. Use '$MOD_CLI apply' to save changes."
else
    echo "Moderne CLI 'mod' not found at $MOD_CLI."
    echo "Install it with: curl https://app.moderne.io/cli | bash"
fi

