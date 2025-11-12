async function fetchAnyUrl(url) {
    const response = await fetch(url, { credentials: "include" });

    if (!response.ok) {
        console.log("Request failed:", response.status, url);
        return null; // <- don’t try to parse empty body
    }

    try {
        return await response.json();
    } catch (err) {
        console.error("Failed to parse JSON from", url, err);
        return null;
    }
}

async function postObjectAsJson(url, object, httpVerbum) {
    const objectAsJsonString = JSON.stringify(object);
    console.log("object here: ", objectAsJsonString);
    const fetchOptions = {
        method: httpVerbum,
        headers: {
            "content-type": "application/json"
        },
        body: objectAsJsonString
    };
    const response = await fetch(url,fetchOptions);
    console.log(response);
    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
    const responseJson = await response.json();
    return [responseJson, response.status];
}

async function fetchUser(){
    let user;
    console.log(window.location.origin + "/me")
    user = await fetchAnyUrl(window.location.origin + "/me");
    if ( user == null) {
        console.log("no user")
        return null
    }
    return user
}
async function fetchUser2() {
    try{
        console.log(window.location.origin + "/me");
        const user = await fetchAnyUrl(window.location.origin + "/me");

        if (!user) {
            console.log("No user found (null response)");
            return null;
        }

        console.log("Fetched user:", user);
        return user;
    }catch (syntaxError){
    }

}
function isEmployee(user) {
    return user?.authority === "EMPLOYEE";
}

export {fetchAnyUrl, postObjectAsJson, fetchUser,fetchUser2,isEmployee};