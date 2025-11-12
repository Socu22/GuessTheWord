package com.g6.guesstheword.RestController;

import com.g6.guesstheword.dto.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
public class ChatGPTRestController {
    @Value("${openai.api.key}")
    private String openapikey;
    private final WebClient webClient;

    public ChatGPTRestController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.openai.com/v1/chat/completions").build();
    }


    @GetMapping("/chooseWord")
    public Map<String, Object> chooseWord(HttpSession session, @RequestParam String category) {
        String Category = category;


        List<Message> messages = new ArrayList<>();
        messages.add(new Message("user", "make guess the word, using 5 emojis. Do not use unrelated emojis." +
                "Only choose emojis that directly relate to the chosen word. the category is " + Category + ". " +
                "the format is: wordchosen/emoji1-emoji2-emoji3-emoji4-emoji5. Follow the format, dont write anything else before or after, " +
                "there has to be a dash between every emoji . try choosing less popular words. it must not be one of the following:" + session.getAttribute("usedWords")));


        Message message = chatWithGPT(messages);


        String[] splitMessage = message.getContent().split("/");
        String word = splitMessage[0];
        if (splitMessage.length != 2  || word.toLowerCase().contains("wordchosen") || splitMessage[1].split("-").length != 5) {
            System.out.println("recursion in motion " + message.getContent());
            return chooseWord(session, Category);
        }
        //System.out.println("\uD83C\uDF2A\uFE0F⚔\uFE0F\uD83D\uDCA8\uD83C\uDF3A\uD83C\uDFF9".length() + " \uD83C\uDF2A\uFE0F⚔\uFE0F\uD83D\uDCA8\uD83C\uDF3A\uD83C\uDFF9".);
        String[] emojis = splitMessage[1].split("-");

        messages.add(message);
        session.setAttribute("messages", messages);
        session.setAttribute("usedWords", session.getAttribute("usedWords") + ", " + word);
        session.setAttribute("hintNumber", 1);
        session.setAttribute("wordToGuess", word);
        // System.out.println(session.getAttribute("usedWords"));
        Map<String, Object> map = new HashMap<>();
        map.put("word", word);
        map.put("emojis", emojis);
        return map;
    }

    @GetMapping("/guessWord")
    public Map<String, Object> guessWord(HttpSession session, @RequestParam String guessedWord) {
        int hintNumber = (int) session.getAttribute("hintNumber");
        if (hintNumber < 1)
            hintNumber = 1;
        if (hintNumber > 3)
            hintNumber = 3;


        List<Message> messages = (List<Message>) session.getAttribute("messages");

        //  if(hintNumber == 1) {
        messages.add(new Message("user", "As someone who doesnt know the word, i want to guess the word. I am guessing " + guessedWord + ". " +
                "First, respond with \"Yes-\" if the guessed word exactly matches the chosen word, otherwise respond \"No-\".\n" +
                "Second, give the hint for this round only, in the format: \"Hint <number>: <hint text>\". Only provide one hint per round. " +
                "There is 3 hints total, this is hint number " + hintNumber + ". The chosen word is " + session.getAttribute("wordToGuess") + "."));
       /* }
        else {
            messages.add(new Message("user", "i am now guessing " + guessedWord + ". Again Yes or No, and hint number " + hintNumber + "."));
        }*/

        Message message = chatWithGPT(messages);

        messages.add(message);
        session.setAttribute("messages", messages);
        session.setAttribute("hintNumber", hintNumber + 1);
        for (Message message1 : messages) {
            System.out.println(message1.getContent());
        }
        String[] messageSplit = message.getContent().split("-");

        Map map = new HashMap();
        if(messageSplit[0].toLowerCase().contains("yes"))
            map.put("isItCorrect", true);
        else if(messageSplit[0].toLowerCase().contains("no"))
            map.put("isItCorrect", false);
        else {
            System.out.println("recursion: " + message.getContent());
            return guessWord(session, guessedWord);
        }
        map.put("text", messageSplit[1]);

        return map;
    }

    @GetMapping("/getImage")
    public Map<String, Object> getImage(HttpSession session, @RequestParam String search) {
        Map map = new HashMap<>();
        map.put("images", getImagesFromGoogle(search));
        return map;
    }


    public Message chatWithGPT(List<Message> messages) {
        ChatRequestDTO chatRequest = new ChatRequestDTO();
        //ChatRequest objekt har jeg dannet med https://www.jsonschema2pojo.or g/ værktøj
        chatRequest.setModel("gpt-3.5-turbo"); //vælg rigtig model. se powerpoint
        /*List<Message> lstMessages = new ArrayList<>(); //en liste af messages med roller

        lstMessages.add(new Message("system", "You are a helpful assistant."));
        lstMessages.add(new Message("user", "Where is " + message));*/
        chatRequest.setMessages(messages);
        chatRequest.setN(1); //n er antal svar fra chatgpt
        chatRequest.setTemperature(1); //jo højere jo mere fantasifuldt svar (se powerpoint)
        chatRequest.setMaxTokens(30); //længde af svar
        chatRequest.setStream(false); //
        //Stream stream = true, //er for viderekomne, der kommer flere svar asynkront
        chatRequest.setPresencePenalty(1); //noget med ikke at gentage sig. se powerpoint
        ChatResponseDTO response = webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(openapikey))
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponseDTO.class)
                .block();
        List<Choice> lst = response.getChoices();
        //Usage usg = response.getUsage();
        //Map<String, Object> map = new HashMap<>();
        //map.put("Usage", usg); map.put("Choices", lst);

        for (Choice choice : lst) {
            return choice.getMessage();
        }
        return null;
    }
    public List<String> getImagesFromGoogle(String query) {
        String apiKey = "AIzaSyAcAKhcRXE5DHGtiF-hkre2e5zn3Pfx4R4"; // from Google Cloud Console
        String cx = "90540985cc05b42ea"; // from https://cse.google.com/cse/all

        try {
            String url = "https://www.googleapis.com/customsearch/v1"
                    + "?key=" + apiKey
                    + "&cx=" + cx
                    + "&q=" + URLEncoder.encode(query + " transparent background", StandardCharsets.UTF_8)
                    + "&searchType=image"
                    + "&fileType=png"
                    + "&num=10"; // ✅ up to 10

            WebClient webClient = WebClient.create();
            Map<String, Object> response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<String> imageUrls = new ArrayList<>();

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items != null && !items.isEmpty()) {
                for (Map<String, Object> item : items) {
                    BufferedImage image = ImageIO.read(new URL((String) item.get("link")));
                    if (image.getColorModel().hasAlpha()) {
                        imageUrls.add((String) item.get("link"));
                   }

                }
            } else {
                System.err.println("No images found for query: " + query);
            }

            return imageUrls;
        } catch (WebClientResponseException e) {
            System.err.println("❌ API Error: " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString());
            return List.of();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    /* public String generateImage(String prompt) {

         // Build the request body
         Map<String, Object> requestBody = new HashMap<>();
         requestBody.put("model", "gpt-image-1"); // the mini version
         requestBody.put("prompt", prompt);
         requestBody.put("size", "1024x1024"); // optional, can also use "512x512" or "256x256" for cheaper images
         requestBody.put("n", 1); // number of images to generate
         requestBody.put("quality", "low"); // optional: "low", "standard", "high"

         // Send the HTTP POST
         WebClient webClient = WebClient.builder()
                 .baseUrl("https://api.openai.com/v1/images/generations")
                 .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openapikey)
                 .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                 .build();

         // Response mapping class (inner DTO)
         class ImageData {
             public String url;
             public String b64_json; // if you request base64 output instead
         }
         class ImageResponse {
             public List<ImageData> data;
         }


         ImageResponse response = webClient.post()
                 .bodyValue(requestBody)
                 .retrieve()
                 .bodyToMono(ImageResponse.class)
                 .block();

         if (response != null && !response.data.isEmpty()) {
             System.out.println( "response data: " + response.data);
             return response.data.get(0).url; // returns the image URL
         }

         return null;
     }

 }*/
    public String generateImageFlagship(String prompt) {
        WebClient webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1/images/generations")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openapikey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-image-1-mini"); // flagship model
        requestBody.put("prompt", prompt);
        requestBody.put("size", "1024x1024");
        requestBody.put("n", 1);
        // No 'quality' field — not yet public



        try {
            String response = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            System.out.println(response);
            /*if (response != null && response.data != null && !response.data.isEmpty()) {
                System.out.println("url: " + response.data.get(0).b64_json);
                System.out.println("url: " + response.data.get(0).url);
                return response.data.get(0).url;
            }*/
        } catch (WebClientResponseException e) {
            System.err.println("Error: " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString());
        }

        return null;
    }
    public static class ImageResponse {
        public List<ImageData> data;
    }

    public static class ImageData {
        public String url;
        public String b64_json;
    }
}