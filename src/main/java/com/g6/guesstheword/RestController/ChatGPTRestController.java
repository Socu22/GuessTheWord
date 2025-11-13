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
import java.io.IOException;
import java.net.HttpURLConnection;
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


        Message message = chatWithGPT(messages, 30);


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



        List<Message> messages = (List<Message>) session.getAttribute("messages");

        String firstStep = "As someone who doesnt know the word, i want to guess the word. I am guessing " + guessedWord + ". " +
        "First, respond with \"Yes-\" if the guessed word exactly matches the chosen word, otherwise respond \"No-\".\n";
        String secondStepHints = "Second, give the hint for this round only, in the format: \"Hint <number>: <hint text> -\". Only provide one hint per round. " +
                "There is 3 hints total, this is hint number " + hintNumber;
        String secondStepNoHints = "Second, respond \"-\"";
        String thirdStep =  ". Third, give some text to why you think their guess is good or bad, dependent on the emojis or the previous hints. dont reveal the actual chosen word" +
                ". The chosen word is " + session.getAttribute("wordToGuess") + ".";
        if(hintNumber < 4) {
            messages.add(new Message("user", firstStep + secondStepHints + thirdStep));
        }
        else {
            messages.add(new Message("user", firstStep + secondStepNoHints + thirdStep));
        }

        Message message = chatWithGPT(messages, 60);


        for (Message message1 : messages) {
            System.out.println(message1.getContent());
        }
        String[] messageSplit = message.getContent().split("-");

        Map map = new HashMap();
        if(messageSplit.length != 3){
            System.out.println("recursion: " + message.getContent());
            return guessWord(session, guessedWord);
        }
        messages.add(message);
        session.setAttribute("messages", messages);
        session.setAttribute("hintNumber", hintNumber + 1);
        if(messageSplit[0].toLowerCase().contains("yes"))
            map.put("isItCorrect", true);
        else if(messageSplit[0].toLowerCase().contains("no"))
            map.put("isItCorrect", false);
        else {
            System.out.println("recursion: " + message.getContent());
            return guessWord(session, guessedWord);
        }
        map.put("text", messageSplit[1]);
        map.put("upliftingText", messageSplit[2]);

        return map;
    }

    @GetMapping("/getImage")
    public Map<String, Object> getImage(HttpSession session, @RequestParam String search) {
        Map map = new HashMap<>();
        map.put("images", getImagesFromGoogle(search));
        return map;
    }


    public Message chatWithGPT(List<Message> messages, int maxWords) {
        ChatRequestDTO chatRequest = new ChatRequestDTO();
        //ChatRequest objekt har jeg dannet med https://www.jsonschema2pojo.or g/ værktøj
        chatRequest.setModel("gpt-4o-mini"); //vælg rigtig model. se powerpoint
        /*List<Message> lstMessages = new ArrayList<>(); //en liste af messages med roller

        lstMessages.add(new Message("system", "You are a helpful assistant."));
        lstMessages.add(new Message("user", "Where is " + message));*/
        chatRequest.setMessages(messages);
        chatRequest.setN(1); //n er antal svar fra chatgpt
        chatRequest.setTemperature(1); //jo højere jo mere fantasifuldt svar (se powerpoint)
        chatRequest.setMaxTokens(maxWords); //længde af svar
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
        System.out.println("started gettting images");

        String apiKey = "AIzaSyAcAKhcRXE5DHGtiF-hkre2e5zn3Pfx4R4"; // from Google Cloud Console
        String cx = "90540985cc05b42ea"; // from https://cse.google.com/cse/all

        try {
            String url = "https://www.googleapis.com/customsearch/v1"
                    + "?key=" + apiKey
                    + "&cx=" + cx
                    + "&q=" + URLEncoder.encode(query + " transparent background", StandardCharsets.UTF_8)
                    + "&searchType=image"
                    + "&fileType=png"
                    + "&safe=active"
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
                int numberOfImages = 2;
                for (Map<String, Object> item : items) {
                    if(!isNotBadSite((String)item.get("link"))) {
                        try {
                            BufferedImage image = ImageIO.read(new URL((String) item.get("link")));
                            if (image != null && image.getColorModel().hasAlpha() && isActuallyTransparent(image)) {
                                System.out.println("added image: " + item.get("link"));
                                imageUrls.add((String) item.get("link"));
                                numberOfImages--;
                                if(numberOfImages == 0){
                                    System.out.println("done getting images");
                                    return imageUrls;
                                }

                            }
                            else {
                                System.out.println("not transparent" + item.get("link"));
                            }
                        } catch (IOException e) {
                            System.err.println("⚠️ Failed to read image: " + item.get("link") + " - " + e.getMessage());
                        }
                    }
                    else
                        System.out.println("bad site: " + item.get("link"));
                }

            } else {
                System.err.println("No images found for query: " + query);
                return imageUrls;
            }
            System.out.println("didnt get all images");
            return imageUrls;
        }
        catch(Exception e){
            e.printStackTrace();
            return List.of();
        }



    }

    boolean isActuallyTransparent(BufferedImage image) {
        if (image == null || !image.getColorModel().hasAlpha()) return false;

        int width = image.getWidth();
        int height = image.getHeight();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int pixel = image.getRGB(x, y);
                int alpha = (pixel >> 24) & 0xff;
                if (alpha < 255) {
                    return true; // found a transparent pixel
                }
            }
        }
        return false; // no transparency found
    }
    boolean isNotBadSite(String site) {
        String[]  urls = {"pngimg.com", "stickpng.com"};
        for (String url : urls) {
            if(site.toLowerCase().contains(url)){
                return true;
            }
        }
        return false;
    }
}