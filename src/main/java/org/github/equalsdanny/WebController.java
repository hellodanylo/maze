package org.github.equalsdanny;

import java.util.HashMap;
import java.util.Random;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.ModelAndView;

import com.google.gson.Gson;

@Controller
public class WebController {

    private Random random = new Random();
    private Gson gson = new Gson();

    @RequestMapping("/play")
    public ModelAndView helloWorld() {

        HashMap<String, String> model = new HashMap<>();

        model.put("gameId", String.valueOf(random.nextInt(100)));

        return new ModelAndView("play", model);
    }

    @RequestMapping("/api/level")
    public ModelAndView apiLevel(WebRequest request) {
        HashMap<String, String> model = new HashMap<>();

        model.put("maze", gson.toJson(MazeGenerator.generate(25, 25)));
        model.put("gameId", request.getParameter("gameId"));
        return new ModelAndView("level", model);
    }
}
