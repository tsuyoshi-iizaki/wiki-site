import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../plugins/emitters/ogImage"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
        <style dangerouslySetInnerHTML={{ __html: `
          body:not(.wiki-authed) #quartz-root { display: none !important; }
          body:not(.wiki-authed) footer { display: none !important; }
          .wiki-gate {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            background: var(--light, #faf8f8);
            font-family: var(--bodyFont, system-ui);
          }
          .wiki-gate-card {
            text-align: center; padding: 2rem;
            border: 1px solid var(--lightgray, #e5e5e5);
            border-radius: 8px; max-width: 320px; width: 90%;
            background: var(--light, #fff);
          }
          .wiki-gate-card h2 { margin: 0 0 1rem; color: var(--dark, #2b2b2b); }
          .wiki-gate-card input {
            width: 100%; padding: .5rem; margin-bottom: .75rem;
            border: 1px solid var(--lightgray, #ccc); border-radius: 4px;
            font-size: 1rem; box-sizing: border-box;
          }
          .wiki-gate-card button {
            width: 100%; padding: .5rem; border: none; border-radius: 4px;
            background: var(--secondary, #284b63); color: #fff;
            font-size: 1rem; cursor: pointer;
          }
          .wiki-gate-card button:hover { opacity: .85; }
          .wiki-gate-err { color: #c0392b; font-size: .85rem; margin-bottom: .5rem; }
          body.wiki-authed .wiki-gate { display: none !important; }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var H="5a4238619a0d70aa82f35543d0bdb6d470e6d477a160554e5cce523357f8b6c6";
            if(sessionStorage.getItem("wiki-auth")===H){
              document.body?document.body.classList.add("wiki-authed"):
              document.addEventListener("DOMContentLoaded",function(){document.body.classList.add("wiki-authed")});
            }
          })();
        `}} />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
