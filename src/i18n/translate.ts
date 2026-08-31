import { supabase } from "@/lib/supabase";

export async function translateText(
    text: string,
    targetLanguage: "en" | "hi" | "ur"
) {
    if (!text?.trim() || targetLanguage === "en") {
        return text;
    }

    const { data, error } = await supabase.functions.invoke(
        "translate",
        {
            body: {
                text,
                targetLanguage,
                sourceLanguage: "auto",
            },
        }
    );

    if (error) {
        console.error("Translation error:", error);
        return text;
    }

    return data?.translatedText || text;
}