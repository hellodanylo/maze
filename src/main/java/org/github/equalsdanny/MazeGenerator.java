package org.github.equalsdanny;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Random;
import java.util.Stack;

public class MazeGenerator {
    public static int[][] generate(int width, int height) {
	int[][] maze = new int[width][height];
	for(int i = 0;i < width;i++) {
	    Arrays.fill(maze[i], 1);
	}	
	
	boolean[][] visited = new boolean[width][height];
	Stack<Point> backtrack = new Stack<>();
	
	Random random = new Random();
	
	Point point = new Point(1, 1);//Point(random.nextInt(width-2)+1, random.nextInt(height-2)+1);
	backtrack.add(point);
	
	while(backtrack.size() > 0) {
	    visited[point.x][point.y] = true;
	    maze[point.x][point.y] = 0;
	    
	    List<Direction> directions = new ArrayList<>(4);
	    Collections.addAll(directions, Direction.values());
	    
	    boolean deadEnd = true;
	    
	    while(directions.size() > 0) {
        	    Direction direction = directions.get(random.nextInt(directions.size()));
        	    
        	    switch(direction) {
        	    case UP:
        		if(point.y+2 < height && !visited[point.x][point.y+2]) {
        		    maze[point.x][point.y+2] = 0;
        		    maze[point.x][point.y+1] = 0;
        		    point = new Point(point.x, point.y+2);
        		    backtrack.push(point);
        		    deadEnd = false;
        		    directions.clear();
        		}
        		break;
        	    case DOWN:
        		if(point.y-2 >= 0 && !visited[point.x][point.y-2]) {
        		    maze[point.x][point.y-2] = 0;
        		    maze[point.x][point.y-1] = 0;
        		    point = new Point(point.x, point.y-2);
        		    backtrack.push(point);
        		    deadEnd = false;
        		    directions.clear();
        		}
        		break;
        	    case LEFT:
        		if(point.x-2 >= 0 && !visited[point.x-2][point.y]) {
        		    maze[point.x-2][point.y] = 0;
        		    maze[point.x-1][point.y] = 0;
        		    point = new Point(point.x-2, point.y);
        		    backtrack.push(point);
        		    deadEnd = false;
        		    directions.clear();
        		}
        		break;
        	    case RIGHT:
        		if(point.x+2 < width && !visited[point.x+2][point.y]) {
        		    maze[point.x+2][point.y] = 0;
        		    maze[point.x+1][point.y] = 0;
        		    point = new Point(point.x+2, point.y);
        		    backtrack.push(point);
        		    deadEnd = false;
        		    directions.clear();
        		}
        		break;
        	    }
        	    
        	    directions.remove(direction);
	    }
	    
	    if(deadEnd) {
		point = backtrack.pop();
	    }
	}
	
	
	return maze;
    }

    private static boolean isInBounds(int index, int limit) {
	return index >= 0 && index < limit;
    }
    
    private static enum Direction {UP,RIGHT,DOWN,LEFT};

    
    private static class Point {
	public Point(int x, int y) {
	    this.x = x;
	    this.y = y;
	}
	
	public int x;
	public int y;
    }
}
