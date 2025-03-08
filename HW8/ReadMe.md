Wasn't too bad No issues. Ok I lied I cant view this live using pages i get thhis error Content-Security-Policy: The page’s settings blocked the loading of a resource (img-src) at https://michaelhowell2.github.io/favicon.ico because it violates the following directive: “img-src data:” 2 FaviconLoader.sys.mjs:175:20 I've never ran into this before..Had to ask Gpt which I typically try to stay away from but was confused but it said.

"Observations

    No Explicit CSP Defined: Your HTML does not include a <meta http-equiv="Content-Security-Policy"> tag in the <head> section. This means the CSP blocking the favicon isn’t coming from your code directly.
    Favicon Not Specified: You haven’t explicitly defined a favicon using a <link rel="icon"> tag. Browsers often try to fetch /favicon.ico by default, and GitHub Pages might be applying a default CSP that’s causing the block.
    External Resources: You’re loading jQuery from https://code.jquery.com/jquery-3.6.0.min.js, and images from a local imgs/ directory (imgs/Poe.png, imgs/raven.jpg, imgs/elenor.jpg). If GitHub Pages has a restrictive default CSP, it could affect these resources too, though the error you mentioned only flags the favicon.

Why the Favicon Is Blocked

Since your HTML doesn’t set a CSP, the img-src data: restriction is likely coming from GitHub Pages’ default security settings or a misconfiguration at the server level. The browser is attempting to load https://michaelhowell2.github.io/favicon.ico, but the CSP only allows data: URLs for images, which blocks the HTTPS request.
How to Fix It

You can’t directly modify server-side headers on GitHub Pages, but you can add a CSP meta tag to override or supplement the default policy. Here’s how to resolve the issue:
Step 1: Add a Favicon Explicitly

First, let’s ensure the favicon is properly defined. If you have a favicon.ico file in your repository’s root directory, add this to your <head> section:
<link rel="icon" type="image/x-icon" href="/favicon.ico"> and then it suggested I add a favicon which i didnt want to delve into yet so I asked if can work around the favicon issue and gave me this. Well after I asked what a favicon is...Anyways...Honestly i don't even know how this Favicon thing popped up...

"Solution: Refine Without a Favicon

Here are two approaches—choose the one that fits your needs best:
Approach 1: Add a Minimal CSP to Allow Your Resources

Add a CSP meta tag to your <head> that permits your site’s resources (like the images in imgs/) without worrying about the favicon. Since the favicon isn’t part of your assignment, we’ll ignore its blockage.

Update your <head> like this:
html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://code.jquery.com; img-src 'self' data:">
    <title>Having Fun with Poe and JQuery</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        /* Your existing styles */
    </style>
</head>

    default-src 'self' https://code.jquery.com: Allows scripts and other resources from your domain and jQuery’s CDN.
    img-src 'self' data:: Permits images from your domain (e.g., imgs/Poe.png) and keeps data: in case GitHub Pages enforces it. The favicon request will still fail, but it won’t break your assignment.

Why This Works: Your assignment’s images will load fine, and the favicon error becomes irrelevant since it’s not part of your requirements. The console warning might persist, but it won’t affect functionality.
Approach 2: Trick the Browser with an Empty Favicon Link

You can tell the browser you have a favicon (without actually providing one) by linking to a data: URL. This avoids the default /favicon.ico request entirely.

Add this to your <head>:
html
<link rel="icon" type="image/x-icon" href="data:,">

Your updated <head> would look like:
html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Having Fun with Poe and JQuery</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="icon" type="image/x-icon" href="data:,">
    <style>
        /* Your existing styles */
    </style>
</head>

    href="data:,": This is an empty data URL that satisfies the browser’s favicon request without loading anything. It’s a lightweight way to silence the request.

Why This Works: The browser stops looking for /favicon.ico, so the CSP error disappears. No extra files are needed, and your assignment remains unaffected.
Which Approach Should You Use?

    Approach 1 (CSP): Use this if you want to explicitly control resource loading and don’t mind the favicon error lingering in the console (since it’s not required for your assignment).
    Approach 2 (Empty Favicon): Use this if you want a cleaner console with no errors and the simplest fix. It’s probably the better choice for your situation since it fully resolves the issue without extra complexity."  SO I took it's advice...
Ok so after taking gpt advice it still doesn't work so I ammended my request to say  it works on VS code but not GitHub here is response. 

"If your code runs perfectly on VS Code’s Live Server without the Content-Security-Policy (CSP) error about favicon.ico, it confirms that the issue is specific to GitHub Pages and not your code itself. This aligns with what we suspected: GitHub Pages is applying a default CSP (img-src data:) that’s stricter than a local server, and it’s interfering with the browser’s automatic favicon request.

Since it works locally, let’s focus on making it work on GitHub Pages (https://michaelhowell2.github.io) without the error. The fact that the <link rel="icon" type="image/x-icon" href="data:,"> didn’t fully suppress the favicon request on GitHub Pages suggests we need a more robust solution. Here’s how we can fix it definitively.
Why It Works Locally but Not on GitHub Pages

    Local Server (VS Code Live Server): Doesn’t enforce a CSP by default, so the browser’s request for /favicon.ico either fails silently (404) or is ignored. The data:, favicon link likely prevents the request entirely, and there’s no CSP to block it.
    GitHub Pages: Applies a default CSP (img-src data:) server-side, which blocks the favicon request unless explicitly allowed. Even with the data:, link, something (browser behavior or GitHub’s configuration) might still trigger the request, hitting the CSP restriction.

Final Fix for GitHub Pages

Since you don’t need a favicon for your assignment and the data:, trick isn’t fully working, let’s combine it with a CSP override and ensure GitHub Pages respects it. We’ll also double-check deployment to rule out caching issues."